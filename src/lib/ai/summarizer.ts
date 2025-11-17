/**
 * Note Summarizer Service
 * Uses LangChain to summarize notes into concise, topic-based summaries
 */

import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseAIService, AIServiceOptions } from './base-service';
import { NoteSummary } from './types';
import { extractDeepSeekJSON } from '@/lib/utils/json-extractor';

export class NoteSummarizerService extends BaseAIService {
  constructor(options?: AIServiceOptions) {
    super(options);
  }

  /**
   * Summarize a note into key points and topics
   */
  async summarize(
    title: string,
    content: string,
    maxLength: 'short' | 'medium' | 'long' = 'medium'
  ): Promise<NoteSummary> {
    this.validateConfig();

    try {
      const llm = this.getLLM('summarizer');

      // Create a structured prompt for summarization
      const summaryPrompt = PromptTemplate.fromTemplate(`
You are an expert at summarizing notes. Given the following note, provide:
1. A concise summary (2-3 sentences)
2. Key points (3-5 bullet points)
3. Main topics/themes (2-4 topics)

Note Title: {title}
Note Content: {content}

Summary Length: {maxLength}

Provide the response in the following JSON format:
{{
  "summary": "Brief summary here",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "topics": ["topic 1", "topic 2"]
}}

Return only valid JSON, no additional text.
`);

      const chain = summaryPrompt.pipe(llm).pipe(new StringOutputParser());

      const result = await chain.invoke({
        title: title || 'Untitled Note',
        content: content || '',
        maxLength,
      });

      // Parse the JSON response (handles DeepSeek R1 thinking tags)
      const parsed = extractDeepSeekJSON(result);

      return {
        summary: parsed.summary,
        keyPoints: parsed.keyPoints || [],
        topics: parsed.topics || [],
        wordCount: content.split(/\s+/).length,
      };
    } catch (error) {
      const aiError = this.handleError(error, 'summarize');
      throw new Error(aiError.message);
    }
  }

  /**
   * Generate a very short summary (one sentence)
   */
  async quickSummary(title: string, content: string): Promise<string> {
    this.validateConfig();

    try {
      const llm = this.getLLM('summarizer', 0.2); // Very low temperature for consistency

      const quickPrompt = PromptTemplate.fromTemplate(`
Summarize the following note in ONE sentence (maximum 20 words):

Title: {title}
Content: {content}

One-sentence summary:
`);

      const chain = quickPrompt.pipe(llm).pipe(new StringOutputParser());

      const result = await chain.invoke({
        title: title || 'Untitled Note',
        content: content || '',
      });

      return result.trim();
    } catch (error) {
      const aiError = this.handleError(error, 'quickSummary');
      throw new Error(aiError.message);
    }
  }

  /**
   * Batch summarize multiple notes
   */
  async batchSummarize(
    notes: Array<{ title: string; content: string }>
  ): Promise<NoteSummary[]> {
    const summaries = await Promise.all(
      notes.map((note) => this.summarize(note.title, note.content))
    );
    return summaries;
  }
}
