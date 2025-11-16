"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FileText, Network, Brain, Lightbulb, Layers } from "lucide-react";

export type AIActionType =
  | "summarize"
  | "explain"
  | "mindmap"
  | "quiz"
  | "flashcards"
  | "improve";

interface AIActionBubbleProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onAction: (action: AIActionType) => void;
  onClose: () => void;
}

const ACTIONS = [
  {
    id: "summarize" as AIActionType,
    icon: Sparkles,
    label: "Summarize",
    color: "#8b5cf6", // purple
    bgHover: "rgba(139, 92, 246, 0.1)",
  },
  {
    id: "explain" as AIActionType,
    icon: Lightbulb,
    label: "Explain",
    color: "#f59e0b", // amber
    bgHover: "rgba(245, 158, 11, 0.1)",
  },
  {
    id: "mindmap" as AIActionType,
    icon: Network,
    label: "Mind Map",
    color: "#63cdff", // quicknotes blue
    bgHover: "rgba(99, 205, 255, 0.1)",
  },
  {
    id: "quiz" as AIActionType,
    icon: Brain,
    label: "Create Quiz",
    color: "#8ef292", // quicknotes green
    bgHover: "rgba(142, 242, 146, 0.1)",
  },
  {
    id: "flashcards" as AIActionType,
    icon: Layers,
    label: "Flashcards",
    color: "#ec4899", // pink
    bgHover: "rgba(236, 72, 153, 0.1)",
  },
];

export function AIActionBubble({
  isVisible,
  position,
  onAction,
  onClose,
}: AIActionBubbleProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop to close on click outside */}
          <div
            className="fixed inset-0 bg-black/10"
            style={{ zIndex: 60 }}
            onClick={onClose}
          />

          {/* Action Bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              left: position.x,
              top: position.y - 60,
              zIndex: 100,
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
            }}
            className="rounded-xl shadow-2xl p-2 flex gap-1"
          >
            {ACTIONS.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    onAction(action.id);
                    onClose();
                  }}
                  className="group relative p-2.5 rounded-lg transition-all hover:scale-110"
                  style={{ color: action.color }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = action.bgHover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  title={action.label}
                >
                  <Icon className="w-5 h-5" />

                  {/* Tooltip */}
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                    style={{
                      backgroundColor: 'var(--text-primary)',
                      color: 'var(--bg-primary)'
                    }}
                  >
                    {action.label}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent" style={{ borderTopColor: 'var(--text-primary)' }} />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
