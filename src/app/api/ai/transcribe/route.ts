import { NextRequest, NextResponse } from 'next/server';
import { TranscriptionService } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string | null;
    const withSummary = formData.get('withSummary') === 'true';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    const transcriptionService = new TranscriptionService();

    let result;
    if (withSummary) {
      result = await transcriptionService.transcribeAndSummarize(
        audioFile,
        language || undefined
      );
    } else {
      const transcription = await transcriptionService.transcribeAudio(
        audioFile,
        language || undefined
      );
      result = { transcription };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Transcription failed' },
      { status: 500 }
    );
  }
}
