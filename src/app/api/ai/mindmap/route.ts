import { NextRequest, NextResponse } from 'next/server';
import { MindmapGeneratorService } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { title, content, notes } = await request.json();

    const generator = new MindmapGeneratorService();

    let mindmap;
    if (notes && Array.isArray(notes)) {
      // Generate from multiple notes
      mindmap = await generator.generateFromMultipleNotes(notes);
    } else {
      // Generate from single note
      if (!content) {
        return NextResponse.json(
          { error: 'Content is required' },
          { status: 400 }
        );
      }
      mindmap = await generator.generateMindmap(title, content);
    }

    return NextResponse.json({ mindmap });
  } catch (error) {
    console.error('Mindmap generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Mindmap generation failed' },
      { status: 500 }
    );
  }
}
