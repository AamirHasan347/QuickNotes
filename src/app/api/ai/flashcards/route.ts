import { NextRequest, NextResponse } from 'next/server';
import { FlashcardGeneratorService } from '@/lib/ai/flashcard-generator';

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

    const { title, content, count, notes } = await request.json();

    const flashcardGenerator = new FlashcardGeneratorService();

    let result;

    if (notes && Array.isArray(notes)) {
      // Generate flashcards from multiple notes
      result = await flashcardGenerator.generateFromMultipleNotes(notes, count || 10);
    } else {
      // Generate flashcards from single note
      if (!content) {
        return NextResponse.json(
          { error: 'Content is required' },
          { status: 400 }
        );
      }

      result = await flashcardGenerator.generateFlashcards(title, content, count || 8);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Flashcard generation error:', error);

    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Flashcard generation failed';
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
