/**
 * AI Service Types
 * Type definitions for AI features
 */

export interface NoteSummary {
  summary: string;
  keyPoints: string[];
  topics: string[];
  wordCount: number;
}

export interface MindmapNode {
  id: string;
  label: string;
  type: 'root' | 'branch' | 'leaf';
  position?: { x: number; y: number };
}

export interface MindmapEdge {
  id: string;
  source: string;
  target: string;
}

export interface GeneratedMindmap {
  nodes: MindmapNode[];
  edges: MindmapEdge[];
  title: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  options?: string[]; // For MCQ questions
  correctAnswerIndex?: number; // For MCQ questions
  explanation?: string; // Detailed explanation of the answer
}

export interface Quiz {
  title: string;
  flashcards: Flashcard[];
  totalCards: number;
  estimatedTime: number; // in minutes
  quizType?: 'flashcard' | 'mcq' | 'mixed';
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface StudyContext {
  noteIds: string[];
  topics: string[];
  conversationHistory: ChatMessage[];
}

export interface TranscriptionResult {
  text: string;
  confidence?: number;
  language?: string;
  duration: number;
}

export type AIProvider = 'openrouter' | 'openai' | 'anthropic';

export interface AIServiceError {
  code: string;
  message: string;
  provider?: AIProvider;
}
