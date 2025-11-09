'use client';

import { useState } from 'react';
import { Sparkles, Network, Brain, FileQuestion, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIToolbarProps {
  onGenerateMindmap: () => void;
  onGenerateQuiz: () => void;
  onSummarizeNote: () => void;
  isProcessing?: boolean;
}

export function AIToolbar({ onGenerateMindmap, onGenerateQuiz, onSummarizeNote, isProcessing = false }: AIToolbarProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const actions = [
    {
      id: 'summarize',
      icon: Sparkles,
      label: 'Summarize Note',
      description: 'Get key points and topics',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => {
        setActiveAction('summarize');
        onSummarizeNote();
      },
    },
    {
      id: 'mindmap',
      icon: Network,
      label: 'Generate Mindmap',
      description: 'Visualize as mindmap',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => {
        setActiveAction('mindmap');
        onGenerateMindmap();
      },
    },
    {
      id: 'quiz',
      icon: FileQuestion,
      label: 'Create Quiz',
      description: 'Generate flashcards',
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => {
        setActiveAction('quiz');
        onGenerateQuiz();
      },
    },
  ];

  return (
    <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-purple-600" />
        <h3 className="text-sm font-semibold text-gray-700">AI Study Tools</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isActive = activeAction === action.id && isProcessing;

          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={action.onClick}
              disabled={isProcessing}
              className={`${action.color} text-white rounded-lg p-3 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex flex-col items-center gap-2">
                {isActive ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
                <div className="text-center">
                  <div className="text-xs font-semibold">{action.label}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">{action.description}</div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-3 text-[10px] text-gray-500 text-center">
        Powered by AI • Free with MiniMax 2
      </div>
    </div>
  );
}
