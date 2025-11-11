import { NextRequest, NextResponse } from 'next/server';
import { QuizMakerService } from '@/lib/ai';

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

    const { title, content, count, type, notes } = await request.json();

    const quizMaker = new QuizMakerService();

    let result;

    if (notes && Array.isArray(notes)) {
      // Generate from multiple notes
      result = await quizMaker.generateFromMultipleNotes(notes, count);
    } else {
      // Generate from single note
      if (!content) {
        return NextResponse.json(
          { error: 'Content is required' },
          { status: 400 }
        );
      }

      switch (type) {
        case 'multiple-choice':
          result = await quizMaker.generateMultipleChoice(title, content, count);
          break;
        case 'fill-in-blank':
          result = await quizMaker.generateFillInBlanks(title, content, count);
          break;
        default:
          result = await quizMaker.generateFlashcards(title, content, count);
      }
    }

    return NextResponse.json({ quiz: result });
  } catch (error) {
    console.error('Quiz generation error:', error);

    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Quiz generation failed';
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
