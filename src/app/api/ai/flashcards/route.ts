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

    const { title, content, count, notes, aiSettings } = await request.json();

    // Use custom AI settings if provided
    const flashcardGenerator = new FlashcardGeneratorService(aiSettings ? {
      model: aiSettings.aiModel,
      temperature: aiSettings.aiTemperature,
    } : undefined);

    let result;

    if (notes && Array.isArray(notes)) {
      // Generate flashcards from multiple notes
      result = await flashcardGenerator.generateFromMultipleNotes(notes, count || 20);
    } else {
      // Generate flashcards from single note
      if (!content) {
        return NextResponse.json(
          { error: 'Content is required' },
          { status: 400 }
        );
      }

      result = await flashcardGenerator.generateFlashcards(title, content, count || 20);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Flashcard generation error:', error);

    // Log the full error for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Flashcard generation failed';
    const isConfigError = errorMessage.includes('API key') || errorMessage.includes('OPENROUTER') || errorMessage.includes('not configured');
    const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED');

    return NextResponse.json(
      {
        error: isConfigError
          ? 'AI service is not properly configured. Please check your environment variables.'
          : isNetworkError
          ? 'Failed to connect to AI service. Please check your internet connection.'
          : `Flashcard generation failed: ${errorMessage}`,
        code: isConfigError ? 'CONFIG_ERROR' : isNetworkError ? 'NETWORK_ERROR' : 'PROCESSING_ERROR',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
