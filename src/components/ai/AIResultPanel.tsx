'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download, PlusCircle } from 'lucide-react';
import { useState } from 'react';

interface AIResultPanelProps {
  isOpen: boolean;
  title: string;
  content: string | React.ReactNode;
  onClose: () => void;
  onInsert?: () => void;
}

export function AIResultPanel({ isOpen, title, content, onClose, onInsert }: AIResultPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof content === 'string') {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse" />
                <h3 className="font-semibold text-gray-900">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="prose prose-sm max-w-none"
              >
                {typeof content === 'string' ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
                ) : (
                  content
                )}
              </motion.div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </button>

              {onInsert && (
                <button
                  onClick={() => {
                    onInsert();
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Insert into Note
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
