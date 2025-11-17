/**
 * Flashcard Generator Service
 * Uses LangChain to generate simple front/back flashcards from notes
 */

import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseAIService, AIServiceOptions } from './base-service';
import { SimpleFlashcard, FlashcardSet } from './types';

export class FlashcardGeneratorService extends BaseAIService {
  constructor(options?: AIServiceOptions) {
    super(options);
  }

  /**
   * Generate simple front/back flashcards from note content
   */
  async generateFlashcards(
    title: string,
    content: string,
    count: number = 20
  ): Promise<FlashcardSet> {
    this.validateConfig();

    try {
      const llm = this.getLLM('quiz', 0.4); // Moderate temperature for quality

      // Create a structured prompt for flashcard generation
      const flashcardPrompt = PromptTemplate.fromTemplate(`
You are an expert at creating study flashcards for students. Analyze the following note and generate concise, well-structured flashcards.

Note Title: {title}
Note Content: {content}

**INSTRUCTIONS:**
1. Extract the most important points, terms, concepts, definitions, and examples.
2. Create up to {count} flashcards based on the content length (generate fewer only if the note is very short).
3. Each flashcard should have:
   - **Front:** A clear, short question, term, or prompt (max 100 characters)
   - **Back:** The correct answer, explanation, or summary (max 200 characters)
4. For lists, processes, or comparisons, create separate flashcards for each part.
5. Keep flashcards concise but informative.
6. Maintain accuracy — do not invent facts not found in the note.
7. Focus on key concepts that help with memorization and recall.
8. **IMPORTANT:** Use plain text only - NO LaTeX notation, NO special escape sequences.
   - For math formulas, use simple notation: "a_c = v^2 / r" instead of LaTeX
   - Avoid backslashes (\\) in your responses
   - Use subscripts with underscore: a_c, F_net
   - Use superscripts with caret: v^2, x^3

**OUTPUT FORMAT:**
Return a valid JSON object with this structure:
{{
  "flashcards": [
    {{
      "front": "What is photosynthesis?",
      "back": "The process by which green plants convert sunlight, water, and CO2 into glucose and oxygen."
    }},
    {{
      "front": "What are the two stages of photosynthesis?",
      "back": "The light-dependent reactions and the Calvin cycle."
    }},
    {{
      "front": "What is the formula for centripetal acceleration?",
      "back": "a_c = v^2 / r, where v is speed and r is radius"
    }}
  ]
}}

**CRITICAL:** For mathematical formulas, use plain text like shown above (a_c = v^2 / r), NOT LaTeX notation.

Generate up to {count} flashcards (the exact number depends on content length and depth).
Return ONLY valid JSON, no additional text or markdown.
`);

      const chain = flashcardPrompt.pipe(llm).pipe(new StringOutputParser());

      const result = await chain.invoke({
        title: title || 'Untitled Note',
        content: content || '',
        count: Math.min(count, 30), // Cap at 30 for quality
      });

      // ==================== DEBUG LOGGING ====================
      console.log('\n🃏 [FLASHCARD GENERATOR] Raw AI Response (BEFORE any cleaning):');
      console.log('📏 Response length:', result?.length || 0);
      console.log('📝 First 500 chars:', result?.substring(0, 500));
      console.log('📝 Last 300 chars:', result?.substring(Math.max(0, (result?.length || 0) - 300)));
      console.log('🔍 Has <think> tags:', /<think>/.test(result || ''));
      console.log('🔍 Has markdown blocks:', /```/.test(result || ''));
      console.log('🔍 Has LaTeX patterns:', /\\[(\[]/.test(result || ''));
      // ========================================================

      // Import the robust JSON extractor
      const { extractDeepSeekJSON } = await import('@/lib/utils/json-extractor');

      let parsed;

      // STRATEGY 1: Try parsing the RAW response first (handles <think> tags automatically)
      try {
        console.log('🔄 [FLASHCARD GENERATOR] Attempting to parse RAW response...');
        parsed = extractDeepSeekJSON(result);
        console.log('✅ [FLASHCARD GENERATOR] Successfully parsed RAW response!');
        console.log('📊 Flashcards found:', parsed.flashcards?.length || 0);
      } catch (rawError) {
        console.warn('⚠️  [FLASHCARD GENERATOR] Raw parsing failed, trying with cleaning...');
        console.warn('Raw parse error:', rawError);

        // STRATEGY 2: Try with cleaning if raw parsing fails
        try {
          let cleaned = result.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');

          // Additional cleaning for common JSON issues
          cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas

          // Convert common LaTeX patterns to plain text
          cleaned = cleaned.replace(/\\?\\\(/g, '(');
          cleaned = cleaned.replace(/\\?\\\)/g, ')');
          cleaned = cleaned.replace(/\\?\\\[/g, '[');
          cleaned = cleaned.replace(/\\?\\\]/g, ']');

          // Convert LaTeX subscripts/superscripts: a_{c} -> a_c, v^{2} -> v^2
          cleaned = cleaned.replace(/_\{([^}]+)\}/g, '_$1');
          cleaned = cleaned.replace(/\^\{([^}]+)\}/g, '^$1');

          cleaned = cleaned.replace(/\\{2,}/g, ''); // Remove multiple backslashes

          console.log('🔄 [FLASHCARD GENERATOR] Attempting to parse CLEANED response...');
          console.log('📝 Cleaned first 500 chars:', cleaned.substring(0, 500));

          parsed = extractDeepSeekJSON(cleaned);
          console.log('✅ [FLASHCARD GENERATOR] Successfully parsed CLEANED response!');
          console.log('📊 Flashcards found:', parsed.flashcards?.length || 0);
        } catch (cleanedError) {
          // Both strategies failed - provide detailed debugging info
          console.error('❌ [FLASHCARD GENERATOR] Both parsing strategies failed!');
          console.error('📛 Raw response (first 500):', result?.substring(0, 500));
          console.error('📛 Raw response (last 300):', result?.substring(Math.max(0, (result?.length || 0) - 300)));
          console.error('❌ Cleaned parse error:', cleanedError);
          throw new Error('AI returned malformed flashcard data. The response could not be parsed as valid JSON.');
        }
      }

      // Add unique IDs to each flashcard
      const flashcardsWithIds: SimpleFlashcard[] = (parsed.flashcards || []).map(
        (card: { front: string; back: string }, index: number) => ({
          id: `flashcard-${Date.now()}-${index}`,
          front: card.front,
          back: card.back,
        })
      );

      return {
        title: title || 'Untitled Note',
        flashcards: flashcardsWithIds,
        totalCards: flashcardsWithIds.length,
      };
    } catch (error) {
      const aiError = this.handleError(error, 'generateFlashcards');
      throw new Error(aiError.message);
    }
  }

  /**
   * Generate flashcards from multiple notes
   */
  async generateFromMultipleNotes(
    notes: Array<{ title: string; content: string }>,
    count: number = 20
  ): Promise<FlashcardSet> {
    this.validateConfig();

    // Combine all notes into a single content string
    const combinedContent = notes
      .map((note) => `## ${note.title}\n${note.content}`)
      .join('\n\n');

    const combinedTitle = `${notes[0].title} + ${notes.length - 1} more note${
      notes.length > 2 ? 's' : ''
    }`;

    return this.generateFlashcards(combinedTitle, combinedContent, count);
  }
}
