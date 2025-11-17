/**
 * Base AI Service
 * Abstract base class for AI service implementations using OpenRouter
 */

import { ChatOpenAI } from '@langchain/openai';
import { AI_CONFIG } from './config';
import { AIProvider, AIServiceError } from './types';

export interface AIServiceOptions {
  provider?: AIProvider;
  model?: string;
  temperature?: number;
}

export abstract class BaseAIService {
  protected provider: AIProvider;
  protected customModel?: string;
  protected customTemperature?: number;

  constructor(options?: AIServiceOptions) {
    this.provider = options?.provider ?? AI_CONFIG.defaultProvider;
    this.customModel = options?.model;
    this.customTemperature = options?.temperature;
  }

  /**
   * Get the appropriate LLM instance based on task
   * Uses OpenRouter with MiniMax 2 model by default, or custom model if specified
   */
  protected getLLM(
    task: keyof typeof AI_CONFIG.models.openrouter,
    temperature?: number
  ) {
    console.log('\n🔧 [BASE SERVICE] getLLM() called');
    console.log('📋 [BASE SERVICE] Task:', task);

    const temp = temperature ?? this.customTemperature ?? (AI_CONFIG.temperature as any)[task] ?? 0.5;
    const maxTokens = (AI_CONFIG.maxTokens as any)[task] ?? 1000;

    console.log('🌡️  [BASE SERVICE] Temperature:', temp);
    console.log('📊 [BASE SERVICE] Max tokens:', maxTokens);

    // Use custom model if specified in settings, otherwise use default
    const model = this.customModel || AI_CONFIG.models.openrouter[task];
    console.log('🤖 [BASE SERVICE] Model:', model);
    console.log('🎨 [BASE SERVICE] Custom model:', this.customModel || 'none');

    // Validate API key exists before creating LLM
    console.log('🔑 [BASE SERVICE] Checking API key...');
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('❌ [BASE SERVICE] OPENROUTER_API_KEY is not configured');
      throw new Error('OPENROUTER_API_KEY is not configured in environment variables');
    }
    console.log('✅ [BASE SERVICE] API key present (length:', process.env.OPENROUTER_API_KEY.length, ')');

    try {
      console.log('🏗️  [BASE SERVICE] Creating ChatOpenAI instance...');
      console.log('🌐 [BASE SERVICE] Base URL:', AI_CONFIG.openrouter.baseURL);
      console.log('🔗 [BASE SERVICE] Site URL:', AI_CONFIG.openrouter.siteUrl);
      console.log('🏷️  [BASE SERVICE] Site Name:', AI_CONFIG.openrouter.siteName);

      const llmInstance = new ChatOpenAI({
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

      console.log('✅ [BASE SERVICE] ChatOpenAI instance created successfully');
      console.log('✅ [BASE SERVICE] getLLM() completed\n');

      return llmInstance;
    } catch (error) {
      console.error('\n💥 [BASE SERVICE] ==================== ERROR ====================');
      console.error('❌ [BASE SERVICE] Error creating ChatOpenAI instance');
      console.error('🔍 [BASE SERVICE] Error type:', typeof error);

      if (error instanceof Error) {
        console.error('📛 [BASE SERVICE] Error name:', error.name);
        console.error('📛 [BASE SERVICE] Error message:', error.message);
        console.error('📛 [BASE SERVICE] Error stack:', error.stack);
      } else {
        console.error('📛 [BASE SERVICE] Non-Error object:', error);
      }

      console.error('💥 [BASE SERVICE] ==========================================\n');

      throw new Error(`Failed to initialize AI model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
