import { NextRequest, NextResponse } from 'next/server';
import { NoteSummarizerService } from '@/lib/ai';

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

    const { title, content, maxLength, aiSettings } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Use custom AI settings if provided
    const summarizer = new NoteSummarizerService(aiSettings ? {
      model: aiSettings.aiModel,
      temperature: aiSettings.aiTemperature,
    } : undefined);
    const summary = await summarizer.summarize(title, content, maxLength);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Summarization error:', error);

    // Log the full error for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Summarization failed';
    const isConfigError = errorMessage.includes('API key') || errorMessage.includes('OPENROUTER') || errorMessage.includes('not configured');
    const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED');

    return NextResponse.json(
      {
        error: isConfigError
          ? 'AI service is not properly configured. Please check your environment variables.'
          : isNetworkError
          ? 'Failed to connect to AI service. Please check your internet connection.'
          : `Summarization failed: ${errorMessage}`,
        code: isConfigError ? 'CONFIG_ERROR' : isNetworkError ? 'NETWORK_ERROR' : 'PROCESSING_ERROR',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
