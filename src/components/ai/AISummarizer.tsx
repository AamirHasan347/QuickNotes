'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { NoteSummary } from '@/lib/ai/types';

interface AISummarizerProps {
  noteTitle: string;
  noteContent: string;
  onSummaryGenerated?: (summary: NoteSummary) => void;
}

export function AISummarizer({ noteTitle, noteContent, onSummaryGenerated }: AISummarizerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<NoteSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    if (!noteContent.trim()) {
      setError('Note content is empty');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent,
          maxLength: 'medium',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }

      const data: NoteSummary = await response.json();
      setSummary(data);
      onSummaryGenerated?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
      console.error('Summary generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleGenerateSummary}
        disabled={isGenerating || !noteContent.trim()}
        className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating Summary...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>AI Summarize</span>
          </>
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {summary && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-purple-900 mb-1">Summary</h4>
            <p className="text-sm text-gray-700">{summary.summary}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-purple-900 mb-1">Key Points</h4>
            <ul className="list-disc list-inside space-y-1">
              {summary.keyPoints.map((point, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-purple-900 mb-1">Topics</h4>
            <div className="flex flex-wrap gap-2">
              {summary.topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Word count: {summary.wordCount}
          </div>
        </div>
      )}
    </div>
  );
}
