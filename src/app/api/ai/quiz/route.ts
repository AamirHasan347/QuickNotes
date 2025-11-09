import { NextRequest, NextResponse } from 'next/server';
import { QuizMakerService } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Quiz generation failed' },
      { status: 500 }
    );
  }
}
