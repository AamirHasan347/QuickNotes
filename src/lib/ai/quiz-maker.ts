/**
 * Quiz Maker Service
 * Generates flashcards and quizzes from notes using LangChain
 */

import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseAIService } from './base-service';
import { Quiz, Flashcard, AIProvider } from './types';
import { parseAIJson } from './utils';

export class QuizMakerService extends BaseAIService {
  constructor(provider?: AIProvider) {
    super(provider);
  }

  /**
   * Generate MCQ quiz from note content
   */
  async generateFlashcards(
    title: string,
    content: string,
    count: number = 5
  ): Promise<Quiz> {
    this.validateConfig();

    try {
      const llm = this.getLLM('quiz');

      const mcqPrompt = PromptTemplate.fromTemplate(`
You are an expert at creating multiple choice quiz questions from educational content.

Given the following note, create {count} high-quality MCQ questions that:
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

Return ONLY valid JSON, no markdown formatting:
`);

      const chain = mcqPrompt.pipe(llm).pipe(new StringOutputParser());

      const result = await chain.invoke({
        title: title || 'Untitled Note',
        content: content || '',
        count: Math.min(count, 10), // Cap at 10 questions for better quality
      });

      const parsed = parseAIJson(result);

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
    count: number = 5
  ): Promise<any> {
    this.validateConfig();

    try {
      const llm = this.getLLM('quiz');

      const mcqPrompt = PromptTemplate.fromTemplate(`
You are an expert at creating multiple choice questions from educational content.

Given the following note, create {count} multiple choice questions with:
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

Return only valid JSON:
`);

      const chain = mcqPrompt.pipe(llm).pipe(new StringOutputParser());

      const result = await chain.invoke({
        title: title || 'Untitled Note',
        content: content || '',
        count: Math.min(count, 15),
      });

      return parseAIJson(result);
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
    count: number = 10
  ): Promise<any> {
    this.validateConfig();

    try {
      const llm = this.getLLM('quiz');

      const fibPrompt = PromptTemplate.fromTemplate(`
Create {count} fill-in-the-blank questions from this content.

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

Return only valid JSON:
`);

      const chain = fibPrompt.pipe(llm).pipe(new StringOutputParser());

      const result = await chain.invoke({
        title: title || 'Untitled Note',
        content: content || '',
        count: Math.min(count, 15),
      });

      return parseAIJson(result);
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
    count: number = 10
  ): Promise<Quiz> {
    const combinedTitle = 'Combined Notes Quiz';
    const combinedContent = notes
      .map((n) => `### ${n.title}\n${n.content}`)
      .join('\n\n');

    return this.generateFlashcards(combinedTitle, combinedContent, count);
  }
}
