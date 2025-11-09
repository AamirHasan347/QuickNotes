import { NextRequest, NextResponse } from 'next/server';
import { NoteSummarizerService } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Summarization failed' },
      { status: 500 }
    );
  }
}
