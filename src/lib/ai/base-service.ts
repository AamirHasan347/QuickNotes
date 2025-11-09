/**
 * Base AI Service
 * Abstract base class for AI service implementations using OpenRouter
 */

import { ChatOpenAI } from '@langchain/openai';
import { AI_CONFIG } from './config';
import { AIProvider, AIServiceError } from './types';

export abstract class BaseAIService {
  protected provider: AIProvider;

  constructor(provider: AIProvider = AI_CONFIG.defaultProvider) {
    this.provider = provider;
  }

  /**
   * Get the appropriate LLM instance based on task
   * Uses OpenRouter with MiniMax 2 model
   */
  protected getLLM(
    task: keyof typeof AI_CONFIG.models.openrouter,
    temperature?: number
  ) {
    const temp = temperature ?? (AI_CONFIG.temperature as any)[task] ?? 0.5;
    const maxTokens = (AI_CONFIG.maxTokens as any)[task] ?? 1000;

    // Use ChatOpenAI with OpenRouter configuration
    const model = AI_CONFIG.models.openrouter[task];
    return new ChatOpenAI({
      model: model,
      temperature: temp,
      maxTokens,
      apiKey: process.env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: AI_CONFIG.openrouter.baseURL,
        defaultHeaders: {
          'HTTP-Referer': AI_CONFIG.openrouter.siteUrl,
          'X-Title': AI_CONFIG.openrouter.siteName,
        },
      },
    });
  }

  /**
   * Handle errors consistently across all AI services
   */
  protected handleError(error: unknown, context: string): AIServiceError {
    console.error(`AI Service Error (${context}):`, error);

    if (error instanceof Error) {
      return {
        code: 'AI_ERROR',
        message: error.message,
        provider: this.provider,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      provider: this.provider,
    };
  }

  /**
   * Validate that the service is properly configured
   */
  protected validateConfig(): void {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }
  }
}
