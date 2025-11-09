'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText } from 'lucide-react';

interface AIPassiveHintProps {
  isVisible: boolean;
  message: string;
  type: 'summarize' | 'expand' | 'improve';
  onAccept: () => void;
  onDismiss: () => void;
}

export function AIPassiveHint({ isVisible, message, type, onAccept, onDismiss }: AIPassiveHintProps) {
  const icon = type === 'summarize' ? FileText : Sparkles;
  const Icon = icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 text-sm text-gray-500 italic my-2 px-3 py-2 bg-purple-50/50 rounded-lg border border-purple-100"
        >
          <Icon className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <span className="flex-1">{message}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onAccept}
              className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={onDismiss}
              className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
