/**
 * AI Configuration
 * Central configuration for AI services using OpenRouter
 */

export const AI_CONFIG = {
  // Model configurations
  models: {
    openrouter: {
      summarizer: 'tngtech/deepseek-r1t2-chimera:free', // DeepSeek R1T2 Chimera (free)
      mindmap: 'tngtech/deepseek-r1t2-chimera:free',
      quiz: 'tngtech/deepseek-r1t2-chimera:free',
      assistant: 'tngtech/deepseek-r1t2-chimera:free',
      transcription: 'tngtech/deepseek-r1t2-chimera:free', // Note: Use Whisper API separately for audio
    },
  },

  // Default provider
  defaultProvider: 'openrouter' as const,

  // Temperature settings for different tasks
  temperature: {
    summarizer: 0.3, // Low temperature for consistent summaries
    mindmap: 0.5, // Medium for structured mindmaps
    quiz: 0.4, // Low-medium for quiz generation
    assistant: 0.7, // Higher for conversational responses
  },

  // Max tokens (optimized for DeepSeek R1T2 Chimera free tier)
  // Note: DeepSeek R1T2 Chimera supports up to 8000 tokens output
  maxTokens: {
    summarizer: 2000,   // Increased for comprehensive summaries
    mindmap: 4000,      // Large increase for complex mindmap structures
    quiz: 6000,         // Very large for generating multiple flashcards/questions
    assistant: 3000,    // Increased for detailed conversational responses
  },

  // OpenRouter specific settings
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    siteName: 'QuickNotes',
    siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
} as const;

/**
 * Validate that API keys are configured
 */
export function validateAIConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.OPENROUTER_API_KEY) {
    errors.push('OPENROUTER_API_KEY is not configured. Please add it to .env.local');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
