import { NextRequest, NextResponse } from 'next/server';
import { StudyAssistantService } from '@/lib/ai';

// Store assistant instance per session (in production, use proper session management)
const assistants = new Map<string, StudyAssistantService>();

export async function POST(request: NextRequest) {
  try {
    // Validate API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY is not configured');
      return NextResponse.json(
        {
          error: 'AI service is not configured. Please contact the administrator.',
          code: 'MISSING_API_KEY'
        },
        { status: 500 }
      );
    }

    const { action, sessionId, question, notes, conversationHistory, topics, noteIds, durationDays, query, limit } = await request.json();

    const assistant = assistants.get(sessionId) || new StudyAssistantService();
    assistants.set(sessionId, assistant);

    let result;

    switch (action) {
      case 'initialize':
        if (!notes || !Array.isArray(notes)) {
          return NextResponse.json(
            { error: 'Notes array is required for initialization' },
            { status: 400 }
          );
        }
        await assistant.initializeWithNotes(notes);
        result = { message: 'Assistant initialized successfully' };
        break;

      case 'ask':
        if (!question) {
          return NextResponse.json(
            { error: 'Question is required' },
            { status: 400 }
          );
        }
        const answer = await assistant.ask(question, conversationHistory || []);
        result = { answer };
        break;

      case 'find-related':
        if (!query) {
          return NextResponse.json(
            { error: 'Query is required' },
            { status: 400 }
          );
        }
        const relatedNotes = await assistant.findRelatedNotes(query, limit || 5);
        result = { relatedNotes };
        break;

      case 'study-suggestions':
        if (!topics || !Array.isArray(topics)) {
          return NextResponse.json(
            { error: 'Topics array is required' },
            { status: 400 }
          );
        }
        const suggestions = await assistant.generateStudySuggestions(topics);
        result = { suggestions };
        break;

      case 'study-plan':
        if (!noteIds || !Array.isArray(noteIds)) {
          return NextResponse.json(
            { error: 'Note IDs array is required' },
            { status: 400 }
          );
        }
        const plan = await assistant.generateStudyPlan(noteIds, durationDays || 7);
        result = { plan };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Study Assistant error:', error);

    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Assistant request failed';
    const isConfigError = errorMessage.includes('API key') || errorMessage.includes('OPENROUTER');

    return NextResponse.json(
      {
        error: isConfigError
          ? 'AI service is not properly configured. Please check your environment variables.'
          : errorMessage,
        code: isConfigError ? 'CONFIG_ERROR' : 'PROCESSING_ERROR'
      },
      { status: 500 }
    );
  }
}
