/**
 * AI Configuration
 * Central configuration for AI services using OpenRouter
 */

export const AI_CONFIG = {
  // Model configurations
  models: {
    openrouter: {
      summarizer: 'minimax/minimax-01', // MiniMax 2 (free)
      mindmap: 'minimax/minimax-01',
      quiz: 'minimax/minimax-01',
      assistant: 'minimax/minimax-01',
      transcription: 'minimax/minimax-01', // Note: Use Whisper API separately for audio
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

  // Max tokens
  maxTokens: {
    summarizer: 500,
    mindmap: 1500,
    quiz: 1000,
    assistant: 2000,
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
