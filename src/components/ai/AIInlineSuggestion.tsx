'use client';

import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface AIInlineSuggestionProps {
  suggestion: string;
  isLoading?: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export function AIInlineSuggestion({ suggestion, isLoading = false, onAccept, onReject }: AIInlineSuggestionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="my-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
          </motion.div>
          <div className="text-sm text-gray-600">AI is thinking...</div>
        </div>

        {/* Loading shimmer effect */}
        <div className="mt-3 space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: `${100 - i * 15}%` }} />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative my-3 px-4 py-3 bg-white rounded-lg border-2 border-purple-200 shadow-sm"
    >
      {/* AI glow effect */}
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -inset-0.5 bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-purple-400/20 rounded-lg blur-sm -z-10"
      />

      <div className="flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className={`text-sm text-gray-700 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
            {suggestion}
          </div>
          {suggestion.length > 200 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-purple-600 hover:text-purple-700 mt-1 font-medium"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={onAccept}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          Insert
        </button>
        <button
          onClick={onReject}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Discard
        </button>
      </div>
    </motion.div>
  );
}
