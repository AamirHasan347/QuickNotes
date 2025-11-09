'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { Quiz } from '@/lib/ai/types';

interface QuizViewerProps {
  quiz: Quiz;
  onClose: () => void;
}

export function QuizViewer({ quiz, onClose }: QuizViewerProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const card = quiz.flashcards[currentCard];

  const nextCard = () => {
    if (currentCard < quiz.flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setShowAnswer(false);
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{quiz.title}</h2>
            <p className="text-sm text-gray-500">
              {quiz.totalCards} flashcards • {quiz.estimatedTime} min
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Flashcard */}
        <div className="flex-1 p-8">
          <div className="text-center mb-4">
            <span className="text-sm font-medium text-gray-500">
              Card {currentCard + 1} of {quiz.totalCards}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border-2 border-purple-200 min-h-[300px] flex flex-col justify-center"
            >
              {/* Question */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                    Question
                  </h3>
                  {card.difficulty && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(card.difficulty)}`}
                    >
                      {card.difficulty}
                    </span>
                  )}
                </div>
                <p className="text-lg font-medium text-gray-900">{card.question}</p>
              </div>

              {/* Hint */}
              {card.hint && !showAnswer && (
                <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">💡 Hint:</span> {card.hint}
                  </p>
                </div>
              )}

              {/* Answer */}
              <AnimatePresence>
                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 border-t-2 border-purple-300">
                      <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3">
                        Answer
                      </h3>
                      <p className="text-base text-gray-800">{card.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Show/Hide Answer Button */}
              <div className="mt-6">
                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mx-auto"
                >
                  {showAnswer ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Hide Answer
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Show Answer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prevCard}
              disabled={currentCard === 0}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-2">
              {quiz.flashcards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentCard(index);
                    setShowAnswer(false);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentCard
                      ? 'bg-purple-600 w-6'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextCard}
              disabled={currentCard === quiz.flashcards.length - 1}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
