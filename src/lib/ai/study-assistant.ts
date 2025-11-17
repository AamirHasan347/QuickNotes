/**
 * Study Assistant Service (Simplified)
 * Conversational Q&A with notes without vector embeddings
 * Note: For production RAG, install proper vector store dependencies
 */

import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { BaseAIService, AIServiceOptions } from './base-service';
import { ChatMessage } from './types';
import { extractDeepSeekJSON, stripThinkingTags } from '@/lib/utils/json-extractor';

interface NoteData {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

export class StudyAssistantService extends BaseAIService {
  private notes: NoteData[] = [];

  constructor(options?: AIServiceOptions) {
    super(options);
  }

  /**
   * Initialize with notes (stores in memory for simple keyword search)
   */
  async initializeWithNotes(notes: NoteData[]): Promise<void> {
    this.notes = notes;
  }

  /**
   * Simple keyword-based search for relevant notes
   */
  private findRelevantNotes(query: string, limit: number = 3): NoteData[] {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(' ').filter((w) => w.length > 3);

    // Score each note by keyword matches
    const scored = this.notes.map((note) => {
      const text = `${note.title} ${note.content} ${note.tags.join(' ')}`.toLowerCase();
      const score = keywords.reduce((acc, keyword) => {
        const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
        return acc + matches;
      }, 0);
      return { note, score };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.note);
  }

  /**
   * Ask a question with context retrieval
   */
  async ask(
    question: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    console.log('\n🤖 [STUDY ASSISTANT] ask() called');
    console.log('📝 [STUDY ASSISTANT] Question:', question?.substring(0, 100));
    console.log('📚 [STUDY ASSISTANT] History length:', conversationHistory?.length || 0);

    console.log('🔍 [STUDY ASSISTANT] Validating config...');
    this.validateConfig();
    console.log('✅ [STUDY ASSISTANT] Config validated');

    console.log('🔍 [STUDY ASSISTANT] Checking notes...');
    console.log('📊 [STUDY ASSISTANT] Notes count:', this.notes.length);

    if (this.notes.length === 0) {
      console.warn('⚠️  [STUDY ASSISTANT] No notes available');
      throw new Error('Study Assistant not initialized. Call initializeWithNotes first.');
    }

    try {
      console.log('🔧 [STUDY ASSISTANT] Getting LLM instance...');
      const llm = this.getLLM('assistant');
      console.log('✅ [STUDY ASSISTANT] LLM instance created');

      // Retrieve relevant notes
      console.log('🔍 [STUDY ASSISTANT] Finding relevant notes...');
      const relevantNotes = this.findRelevantNotes(question);
      console.log('📋 [STUDY ASSISTANT] Found', relevantNotes.length, 'relevant notes');

      // Format context
      console.log('📝 [STUDY ASSISTANT] Formatting context...');
      const context = relevantNotes
        .map((note, i) => `[Note ${i + 1}: ${note.title}]\n${note.content}`)
        .join('\n\n');
      console.log('📏 [STUDY ASSISTANT] Context length:', context.length, 'characters');

      // Format conversation history
      console.log('📝 [STUDY ASSISTANT] Formatting history...');
      const history = conversationHistory
        .slice(-5)
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
      console.log('📏 [STUDY ASSISTANT] History length:', history.length, 'characters');

      console.log('🔨 [STUDY ASSISTANT] Creating prompt template...');
      const ragPrompt = PromptTemplate.fromTemplate(`
You are a helpful study assistant helping a student understand their notes.

Context from notes:
{context}

Conversation history:
{history}

Student question: {question}

Instructions:
- Answer based primarily on the provided context
- Be clear and educational in your explanations
- If the context doesn't contain enough information, say so
- Use examples from the notes when helpful
- Keep responses concise but informative

Your response:
`);
      console.log('✅ [STUDY ASSISTANT] Prompt template created');

      console.log('⛓️  [STUDY ASSISTANT] Creating chain...');
      const chain = RunnableSequence.from([
        ragPrompt,
        llm,
        new StringOutputParser(),
      ]);
      console.log('✅ [STUDY ASSISTANT] Chain created');

      console.log('🚀 [STUDY ASSISTANT] Invoking chain (calling AI)...');
      console.log('⏱️  [STUDY ASSISTANT] This may take 10-30 seconds...');

      const response = await chain.invoke({
        context: context || 'No relevant notes found.',
        history: history || 'No previous conversation',
        question,
      });

      console.log('✅ [STUDY ASSISTANT] Chain invoked successfully');
      console.log('📏 [STUDY ASSISTANT] Raw response length:', response?.length || 0);
      console.log('📝 [STUDY ASSISTANT] Raw response preview:', response?.substring(0, 150));

      // Strip DeepSeek R1's thinking tags from the response
      console.log('🧹 [STUDY ASSISTANT] Stripping thinking tags...');
      const cleanedResponse = stripThinkingTags(response);
      console.log('✅ [STUDY ASSISTANT] Response cleaned');
      console.log('📏 [STUDY ASSISTANT] Cleaned response length:', cleanedResponse?.length || 0);
      console.log('📝 [STUDY ASSISTANT] Cleaned response preview:', cleanedResponse?.substring(0, 150));
      console.log('✅ [STUDY ASSISTANT] ask() completed successfully\n');

      return cleanedResponse;
    } catch (error) {
      console.error('\n💥 [STUDY ASSISTANT] ==================== ERROR ====================');
      console.error('❌ [STUDY ASSISTANT] Error in ask()');
      console.error('🔍 [STUDY ASSISTANT] Error type:', typeof error);
      console.error('🔍 [STUDY ASSISTANT] Error constructor:', error?.constructor?.name);

      if (error instanceof Error) {
        console.error('📛 [STUDY ASSISTANT] Error name:', error.name);
        console.error('📛 [STUDY ASSISTANT] Error message:', error.message);
        console.error('📛 [STUDY ASSISTANT] Error stack:', error.stack);
      } else {
        console.error('📛 [STUDY ASSISTANT] Non-Error object:', error);
      }

      console.error('💥 [STUDY ASSISTANT] ==========================================\n');

      const aiError = this.handleError(error, 'ask');
      throw new Error(aiError.message);
    }
  }

  /**
   * Find related notes based on keyword matching
   */
  async findRelatedNotes(
    query: string,
    limit: number = 5
  ): Promise<Array<{ id: string; title: string; similarity: number }>> {
    const relevant = this.findRelevantNotes(query, limit);

    return relevant.map((note) => ({
      id: note.id,
      title: note.title,
      similarity: 0.5, // Placeholder score
    }));
  }

  /**
   * Generate study suggestions based on topics
   */
  async generateStudySuggestions(topics: string[]): Promise<string[]> {
    this.validateConfig();

    try {
      const llm = this.getLLM('assistant', 0.8);

      const suggestionPrompt = PromptTemplate.fromTemplate(`
You are a study coach. Given these topics the student is studying, suggest 5 effective study activities:

Topics: {topics}

Provide 5 actionable study suggestions (one per line, no numbering):
`);

      const chain = suggestionPrompt.pipe(llm).pipe(new StringOutputParser());

      const result = await chain.invoke({
        topics: topics.join(', '),
      });

      return result
        .trim()
        .split('\n')
        .filter((s) => s.trim().length > 0);
    } catch (error) {
      const aiError = this.handleError(error, 'generateStudySuggestions');
      throw new Error(aiError.message);
    }
  }

  /**
   * Generate a study plan
   */
  async generateStudyPlan(
    noteIds: string[],
    durationDays: number = 7
  ): Promise<any> {
    this.validateConfig();

    try {
      const llm = this.getLLM('assistant');

      // Get notes content
      const selectedNotes = this.notes.filter((n) => noteIds.includes(n.id));
      const content = selectedNotes
        .map((n) => `${n.title}\n${n.content}`)
        .join('\n\n')
        .slice(0, 3000);

      const planPrompt = PromptTemplate.fromTemplate(`
Create a {duration}-day study plan for the following content:

{content}

Return as JSON:
{{
  "totalDays": 7,
  "plan": [
    {{
      "day": 1,
      "title": "Day 1: Introduction",
      "topics": ["Topic 1", "Topic 2"],
      "activities": ["Read notes", "Create flashcards"],
      "duration": "2 hours"
    }}
  ]
}}

Return only valid JSON:
`);

      const chain = planPrompt.pipe(llm).pipe(new StringOutputParser());

      const result = await chain.invoke({
        duration: durationDays,
        content: content || 'No content available',
      });

      return extractDeepSeekJSON(result);
    } catch (error) {
      const aiError = this.handleError(error, 'generateStudyPlan');
      throw new Error(aiError.message);
    }
  }
}
