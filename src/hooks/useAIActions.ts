'use client';

import { useState, useCallback } from 'react';
import { AIAction } from '@/components/ai/FloatingAIToolbar';

interface UseAIActionsReturn {
  isProcessing: boolean;
  currentSuggestion: string | null;
  error: string | null;
  processAction: (action: AIAction, text: string) => Promise<void>;
  clearSuggestion: () => void;
}

export function useAIActions(): UseAIActionsReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processAction = useCallback(async (action: AIAction, text: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      let prompt = '';
      switch (action) {
        case 'improve':
          prompt = `Improve the following text by making it clearer, more concise, and better written. Maintain the original meaning and tone:\n\n${text}`;
          break;
        case 'summarize':
          prompt = `Summarize the following text in 2-3 concise sentences:\n\n${text}`;
          break;
        case 'explain':
          prompt = `Explain the following text in simple, clear language. Break down complex concepts and provide context:\n\n${text}`;
          break;
        case 'expand':
          prompt = `Expand on the following text by adding more details, examples, and explanations while keeping the same style:\n\n${text}`;
          break;
        case 'translate':
          prompt = `Translate the following text to Spanish:\n\n${text}`;
          break;
      }

      // Call summarizer API for all actions (we can enhance this later with specific endpoints)
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: action,
          content: prompt,
          maxLength: action === 'summarize' ? 'short' : 'medium',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI processing failed');
      }

      const data = await response.json();
      const suggestion = data.summary || 'No suggestion generated';
      setCurrentSuggestion(suggestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process');
      setCurrentSuggestion(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearSuggestion = useCallback(() => {
    setCurrentSuggestion(null);
    setError(null);
  }, []);

  return {
    isProcessing,
    currentSuggestion,
    error,
    processAction,
    clearSuggestion,
  };
}
