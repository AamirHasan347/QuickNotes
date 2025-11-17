/**
 * Quiz Maker Service
 * Generates flashcards and quizzes from notes using LangChain
 */

import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseAIService, AIServiceOptions } from './base-service';
import { Quiz, Flashcard } from './types';
import { extractDeepSeekJSON } from '@/lib/utils/json-extractor';

export class QuizMakerService extends BaseAIService {
  constructor(options?: AIServiceOptions) {
    super(options);
  }

  /**
   * Generate MCQ quiz from note content
   */
  async generateFlashcards(
    title: string,
    content: string,
    count: number = 15
  ): Promise<Quiz> {
    this.validateConfig();

    try {
      const llm = this.getLLM('quiz');

      const mcqPrompt = PromptTemplate.fromTemplate(`
You are an expert at creating multiple choice quiz questions from educational content.

Given the following note, create up to {count} high-quality MCQ questions that:
- Test understanding of key concepts
- Have 4 plausible options each
- Include helpful hints when appropriate
- Vary in difficulty (easy, medium, hard)
- Provide clear explanations for the correct answer

Note Title: {title}
Note Content: {content}

Return the quiz as a JSON object with this EXACT structure:
{{
  "title": "Quiz title based on content",
  "flashcards": [
    {{
      "id": "q1",
      "question": "What is the main principle of...?",
      "options": [
        "The correct answer here",
        "First plausible distractor",
        "Second plausible distractor",
        "Third plausible distractor"
      ],
      "correctAnswerIndex": 0,
      "answer": "The correct answer here",
      "explanation": "Detailed explanation of why this is correct and why others are wrong",
      "hint": "Think about the fundamental concept of...",
      "difficulty": "medium"
    }}
  ],
  "estimatedTime": 10
}}

CRITICAL REQUIREMENTS:
- Each question must have exactly 4 options
- correctAnswerIndex must be 0-3 (the index of the correct option in the options array)
- answer field should match the correct option text
- Make distractors plausible but clearly wrong upon understanding
- Difficulty: easy (recall), medium (understanding), hard (application/analysis)
- estimatedTime in minutes (roughly 2 min per question)
- Generate up to {count} questions based on content length (fewer only if content is very short)

Return ONLY valid JSON, no markdown formatting:
`);

      const chain = mcqPrompt.pipe(llm).pipe(new StringOutputParser());

      const result = await chain.invoke({
        title: title || 'Untitled Note',
        content: content || '',
        count: Math.min(count, 25), // Cap at 25 questions for better quality
      });

      // Debug logging
      console.log('\n📝 [QUIZ MAKER - Flashcards] Raw AI Response:');
      console.log('📏 Response length:', result?.length || 0);
      console.log('📝 First 300 chars:', result?.substring(0, 300));
      console.log('🔍 Has <think> tags:', /<think>/.test(result || ''));

      let parsed;
      try {
        parsed = extractDeepSeekJSON(result);
        console.log('✅ [QUIZ MAKER - Flashcards] JSON parsed successfully');
        console.log('📊 Flashcards count:', parsed.flashcards?.length || 0);
      } catch (error) {
        console.error('❌ [QUIZ MAKER - Flashcards] JSON parsing failed:', error);
        console.error('📛 Raw response:', result);
        throw new Error('AI returned malformed quiz data. Please try again.');
      }

      return {
        title: parsed.title || `${title} - Quiz`,
        flashcards: parsed.flashcards || [],
        totalCards: parsed.flashcards?.length || 0,
        estimatedTime: parsed.estimatedTime || Math.ceil(count * 2),
        quizType: 'mcq',
      };
    } catch (error) {
      const aiError = this.handleError(error, 'generateFlashcards');
      throw new Error(aiError.message);
    }
  }

  /**
   * Generate multiple choice questions
   */
  async generateMultipleChoice(
    title: string,
    content: string,
    count: number = 15
  ): Promise<any> {
    this.validateConfig();

    try {
      const llm = this.getLLM('quiz');

      const mcqPrompt = PromptTemplate.fromTemplate(`
You are an expert at creating multiple choice questions from educational content.

Given the following note, create up to {count} multiple choice questions with:
- 1 correct answer
- 3 plausible distractors
- Varying difficulty levels
- Clear explanations

Note Title: {title}
Note Content: {content}

Return as JSON:
{{
  "title": "Quiz title",
  "questions": [
    {{
      "id": "q-1",
      "question": "Question text?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": 0,
      "explanation": "Why this is correct...",
      "difficulty": "medium"
    }}
  ]
}}

Generate up to {count} questions based on content length (fewer only if content is very short).
Return only valid JSON:
`);

      const chain = mcqPrompt.pipe(llm).pipe(new StringOutputParser());

      const result = await chain.invoke({
        title: title || 'Untitled Note',
        content: content || '',
        count: Math.min(count, 25),
      });

      // Debug logging
      console.log('\n📝 [QUIZ MAKER - MCQ] Raw AI Response:');
      console.log('📏 Response length:', result?.length || 0);
      console.log('🔍 Has <think> tags:', /<think>/.test(result || ''));

      try {
        const parsed = extractDeepSeekJSON(result);
        console.log('✅ [QUIZ MAKER - MCQ] JSON parsed successfully');
        return parsed;
      } catch (error) {
        console.error('❌ [QUIZ MAKER - MCQ] JSON parsing failed:', error);
        console.error('📛 Raw response:', result);
        throw new Error('AI returned malformed MCQ data. Please try again.');
      }
    } catch (error) {
      const aiError = this.handleError(error, 'generateMultipleChoice');
      throw new Error(aiError.message);
    }
  }

  /**
   * Generate fill-in-the-blank questions
   */
  async generateFillInBlanks(
    title: string,
    content: string,
    count: number = 15
  ): Promise<any> {
    this.validateConfig();

    try {
      const llm = this.getLLM('quiz');

      const fibPrompt = PromptTemplate.fromTemplate(`
Create up to {count} fill-in-the-blank questions from this content.

Note Title: {title}
Note Content: {content}

Return as JSON:
{{
  "title": "Quiz title",
  "questions": [
    {{
      "id": "fib-1",
      "sentence": "The ____ is responsible for ____.",
      "blanks": ["mitochondria", "cellular respiration"],
      "hint": "Think about cell organelles"
    }}
  ]
}}

Generate up to {count} questions based on content length (fewer only if content is very short).
Return only valid JSON:
`);

      const chain = fibPrompt.pipe(llm).pipe(new StringOutputParser());

      const result = await chain.invoke({
        title: title || 'Untitled Note',
        content: content || '',
        count: Math.min(count, 25),
      });

      // Debug logging
      console.log('\n📝 [QUIZ MAKER - Fill in Blanks] Raw AI Response:');
      console.log('📏 Response length:', result?.length || 0);
      console.log('🔍 Has <think> tags:', /<think>/.test(result || ''));

      try {
        const parsed = extractDeepSeekJSON(result);
        console.log('✅ [QUIZ MAKER - Fill in Blanks] JSON parsed successfully');
        return parsed;
      } catch (error) {
        console.error('❌ [QUIZ MAKER - Fill in Blanks] JSON parsing failed:', error);
        console.error('📛 Raw response:', result);
        throw new Error('AI returned malformed fill-in-blanks data. Please try again.');
      }
    } catch (error) {
      const aiError = this.handleError(error, 'generateFillInBlanks');
      throw new Error(aiError.message);
    }
  }

  /**
   * Generate quiz from multiple notes
   */
  async generateFromMultipleNotes(
    notes: Array<{ title: string; content: string }>,
    count: number = 15
  ): Promise<Quiz> {
    const combinedTitle = 'Combined Notes Quiz';
    const combinedContent = notes
      .map((n) => `### ${n.title}\n${n.content}`)
      .join('\n\n');

    return this.generateFlashcards(combinedTitle, combinedContent, count);
  }
}
