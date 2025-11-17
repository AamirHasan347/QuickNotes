/**
 * AI Chat API Route
 * Handles conversational Q&A with notes using the StudyAssistantService
 */

import { NextRequest, NextResponse } from 'next/server';
import { StudyAssistantService } from '@/lib/ai/study-assistant';
import { ChatMessage } from '@/lib/ai/types';

interface ChatRequestBody {
  message: string;
  conversationHistory?: ChatMessage[];
  notes?: Array<{
    id: string;
    title: string;
    content: string;
    tags: string[];
  }>;
  aiSettings?: {
    aiModel?: string;
    aiTemperature?: number;
  };
}

export async function POST(request: NextRequest) {
  console.log('\n🚀 [CHAT API] Request started at:', new Date().toISOString());

  try {
    // Step 1: Validate API key
    console.log('📋 [CHAT API] Step 1: Validating API key...');
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('❌ [CHAT API] OPENROUTER_API_KEY is not configured');
      return NextResponse.json(
        {
          error: 'AI service is not configured. Please contact the administrator.',
          code: 'MISSING_API_KEY'
        },
        { status: 500 }
      );
    }
    console.log('✅ [CHAT API] API key is configured');

    // Step 2: Parse request body
    console.log('📋 [CHAT API] Step 2: Parsing request body...');
    const body: ChatRequestBody = await request.json();
    console.log('📦 [CHAT API] Request body:', {
      messageLength: body.message?.length,
      historyLength: body.conversationHistory?.length || 0,
      notesCount: body.notes?.length || 0,
      hasAISettings: !!body.aiSettings
    });

    const { message, conversationHistory = [], notes = [], aiSettings } = body;

    // Step 3: Validate message
    console.log('📋 [CHAT API] Step 3: Validating message...');
    if (!message || message.trim().length === 0) {
      console.error('❌ [CHAT API] Message is empty');
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    console.log('✅ [CHAT API] Message validated:', message.substring(0, 50) + '...');

    // Step 4: Initialize study assistant
    console.log('📋 [CHAT API] Step 4: Initializing StudyAssistantService...');
    const assistant = new StudyAssistantService(aiSettings ? {
      model: aiSettings.aiModel,
      temperature: aiSettings.aiTemperature,
    } : undefined);
    console.log('✅ [CHAT API] StudyAssistantService initialized');

    // Step 5: Initialize with notes
    console.log('📋 [CHAT API] Step 5: Initializing with notes...');
    console.log('📝 [CHAT API] Notes count:', notes.length);
    await assistant.initializeWithNotes(notes);
    console.log('✅ [CHAT API] Notes initialized');

    // Step 6: Get AI response
    console.log('📋 [CHAT API] Step 6: Calling assistant.ask()...');
    console.log('💬 [CHAT API] Question:', message);
    console.log('📚 [CHAT API] Conversation history length:', conversationHistory.length);

    const response = await assistant.ask(message, conversationHistory);

    console.log('✅ [CHAT API] Response received, length:', response?.length || 0);
    console.log('📝 [CHAT API] Response preview:', response?.substring(0, 100));

    // Step 7: Return response
    console.log('📋 [CHAT API] Step 7: Sending response...');
    const result = {
      message: response,
      timestamp: new Date().toISOString(),
    };
    console.log('✅ [CHAT API] Request completed successfully\n');

    return NextResponse.json(result);

  } catch (error) {
    console.error('\n💥 [CHAT API] ==================== ERROR ====================');
    console.error('❌ [CHAT API] Error caught in catch block');
    console.error('🔍 [CHAT API] Error type:', typeof error);
    console.error('🔍 [CHAT API] Error constructor:', error?.constructor?.name);

    // Log the full error for debugging
    if (error instanceof Error) {
      console.error('📛 [CHAT API] Error name:', error.name);
      console.error('📛 [CHAT API] Error message:', error.message);
      console.error('📛 [CHAT API] Error stack:', error.stack);
    } else {
      console.error('📛 [CHAT API] Non-Error object:', error);
    }

    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Chat failed';
    const isConfigError = errorMessage.includes('API key') || errorMessage.includes('OPENROUTER') || errorMessage.includes('not configured');
    const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED');

    console.error('🏷️  [CHAT API] Error category:', isConfigError ? 'CONFIG' : isNetworkError ? 'NETWORK' : 'PROCESSING');
    console.error('💥 [CHAT API] ==========================================\n');

    return NextResponse.json(
      {
        error: isConfigError
          ? 'AI service is not properly configured. Please check your environment variables.'
          : isNetworkError
          ? 'Failed to connect to AI service. Please check your internet connection.'
          : `Chat failed: ${errorMessage}`,
        code: isConfigError ? 'CONFIG_ERROR' : isNetworkError ? 'NETWORK_ERROR' : 'PROCESSING_ERROR',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
