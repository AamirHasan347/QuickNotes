/**
 * AI Services Entry Point
 * Exports all AI services for use throughout the application
 */

export { NoteSummarizerService } from './summarizer';
export { MindmapGeneratorService } from './mindmap-generator';
export { QuizMakerService } from './quiz-maker';
export { StudyAssistantService } from './study-assistant';
export { TranscriptionService } from './transcription';

export * from './types';
export * from './config';

// Singleton instances for convenience
let summarizerInstance: any = null;
let mindmapInstance: any = null;
let quizInstance: any = null;
let assistantInstance: any = null;
let transcriptionInstance: any = null;

export function getNoteSummarizer() {
  if (!summarizerInstance) {
    const { NoteSummarizerService } = require('./summarizer');
    summarizerInstance = new NoteSummarizerService();
  }
  return summarizerInstance;
}

export function getMindmapGenerator() {
  if (!mindmapInstance) {
    const { MindmapGeneratorService } = require('./mindmap-generator');
    mindmapInstance = new MindmapGeneratorService();
  }
  return mindmapInstance;
}

export function getQuizMaker() {
  if (!quizInstance) {
    const { QuizMakerService } = require('./quiz-maker');
    quizInstance = new QuizMakerService();
  }
  return quizInstance;
}

export function getStudyAssistant() {
  if (!assistantInstance) {
    const { StudyAssistantService } = require('./study-assistant');
    assistantInstance = new StudyAssistantService();
  }
  return assistantInstance;
}

export function getTranscriptionService() {
  if (!transcriptionInstance) {
    const { TranscriptionService } = require('./transcription');
    transcriptionInstance = new TranscriptionService();
  }
  return transcriptionInstance;
}
