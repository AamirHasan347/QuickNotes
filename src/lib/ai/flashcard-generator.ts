/**
 * Flashcard Generator Service
 * Uses LangChain to generate simple front/back flashcards from notes
 */

import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseAIService } from './base-service';
import { SimpleFlashcard, FlashcardSet, AIProvider } from './types';

export class FlashcardGeneratorService extends BaseAIService {
  constructor(provider?: AIProvider) {
    super(provider);
  }

  /**
   * Generate simple front/back flashcards from note content
   */
  async generateFlashcards(
    title: string,
    content: string,
    count: number = 8
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
2. Create {count} flashcards (or fewer if note is short).
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

Generate exactly {count} flashcards (or fewer if the note is too short).
Return ONLY valid JSON, no additional text or markdown.
`);

      const chain = flashcardPrompt.pipe(llm).pipe(new StringOutputParser());

      const result = await chain.invoke({
        title: title || 'Untitled Note',
        content: content || '',
        count: Math.min(count, 15), // Cap at 15 for quality
      });

      // Parse the JSON response with better sanitization
      let cleaned = result.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');

      // Additional cleaning for common JSON issues
      // Remove any trailing commas before closing brackets
      cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

      // Convert common LaTeX patterns to plain text before parsing
      // This helps if the AI still uses LaTeX despite instructions
      cleaned = cleaned.replace(/\\?\\\(/g, '('); // Remove \( or \\(
      cleaned = cleaned.replace(/\\?\\\)/g, ')'); // Remove \) or \\)
      cleaned = cleaned.replace(/\\?\\\[/g, '['); // Remove \[ or \\[
      cleaned = cleaned.replace(/\\?\\\]/g, ']'); // Remove \] or \\]

      // Convert LaTeX subscripts/superscripts to plain text
      // e.g., a_{c} -> a_c, v^{2} -> v^2
      cleaned = cleaned.replace(/_\{([^}]+)\}/g, '_$1');
      cleaned = cleaned.replace(/\^\{([^}]+)\}/g, '^$1');

      cleaned = cleaned.replace(/\\{2,}/g, ''); // Remove multiple backslashes

      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseError) {
        // If parsing fails, log the problematic JSON for debugging
        console.error('Failed to parse flashcard JSON:', cleaned.substring(0, 500));
        console.error('Parse error:', parseError);

        // Try to extract JSON using regex as a fallback
        const jsonMatch = cleaned.match(/\{[\s\S]*"flashcards"[\s\S]*\}/);
        if (jsonMatch) {
          // Try parsing the extracted JSON
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch (secondError) {
            throw new Error('Failed to parse AI response. The model returned malformed JSON.');
          }
        } else {
          throw new Error('Failed to extract valid JSON from AI response.');
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
    count: number = 10
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
