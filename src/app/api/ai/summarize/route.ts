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

    const { title, content, maxLength } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const summarizer = new NoteSummarizerService();
    const summary = await summarizer.summarize(title, content, maxLength);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Summarization error:', error);

    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Summarization failed';
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
