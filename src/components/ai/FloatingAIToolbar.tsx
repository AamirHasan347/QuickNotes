'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, FileText, Wand2, Globe, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type AIAction = 'improve' | 'summarize' | 'expand' | 'translate';

interface FloatingAIToolbarProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onAction: (action: AIAction) => void;
  onClose: () => void;
}

const actions = [
  { id: 'improve' as AIAction, icon: Wand2, label: 'Improve', color: 'text-purple-600' },
  { id: 'summarize' as AIAction, icon: FileText, label: 'Summarize', color: 'text-blue-600' },
  { id: 'expand' as AIAction, icon: Sparkles, label: 'Expand', color: 'text-green-600' },
  { id: 'translate' as AIAction, icon: Globe, label: 'Translate', color: 'text-orange-600' },
];

export function FloatingAIToolbar({ isVisible, position, onAction, onClose }: FloatingAIToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={toolbarRef}
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 1000,
          }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="flex items-center gap-1 p-1.5">
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                onClick={() => onAction(action.id)}
                className="group flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                title={action.label}
              >
                <action.icon className={`w-4 h-4 ${action.color} group-hover:scale-110 transition-transform duration-200`} />
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Subtle glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 blur-xl -z-10 opacity-50" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
