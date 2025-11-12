'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, RefreshCw, Sparkles, RotateCcw } from 'lucide-react';
import { FlashcardSet } from '@/lib/ai/types';

interface FlashcardViewerProps {
  flashcardSet: FlashcardSet;
  onClose: () => void;
  onRegenerate?: () => void;
  onSave?: () => void;
}

export function FlashcardViewer({ flashcardSet, onClose, onRegenerate, onSave }: FlashcardViewerProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set());

  const flashcard = flashcardSet.flashcards[currentCard];
  const progress = ((currentCard + 1) / flashcardSet.totalCards) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setViewedCards(prev => new Set(prev).add(currentCard));
    }
  };

  const nextCard = () => {
    if (currentCard < flashcardSet.totalCards - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setCurrentCard(0);
    setIsFlipped(false);
    setViewedCards(new Set());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900">{flashcardSet.title}</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Card {currentCard + 1} of {flashcardSet.totalCards}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Flashcard Area */}
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <div className="perspective-1000" style={{ perspective: '1000px' }}>
                <motion.div
                  className="relative w-full cursor-pointer"
                  onClick={handleFlip}
                  style={{
                    minHeight: '300px',
                    transformStyle: 'preserve-3d'
                  }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                >
                  {/* Front of Card */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 flex flex-col items-center justify-center"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(0deg)'
                    }}
                  >
                    <p className="text-xs uppercase tracking-wide text-amber-600 font-semibold mb-4">
                      Question
                    </p>
                    <p className="text-2xl font-bold text-gray-900 text-center">
                      {flashcard.front}
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
                      <RotateCcw className="w-4 h-4" />
                      <span>Click to reveal answer</span>
                    </div>
                  </div>

                  {/* Back of Card */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 flex flex-col items-center justify-center"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-4">
                      Answer
                    </p>
                    <p className="text-xl text-gray-800 text-center leading-relaxed">
                      {flashcard.back}
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
                      <RotateCcw className="w-4 h-4" />
                      <span>Click to see question</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Hint Text */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400 italic">
                  {isFlipped ? 'Got it? Move to the next card!' : 'Try to recall the answer before flipping'}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={prevCard}
            disabled={currentCard === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Card Progress Indicators */}
          <div className="flex gap-2">
            {flashcardSet.flashcards.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  viewedCards.has(index)
                    ? 'bg-green-500 w-3 h-3'
                    : index === currentCard
                    ? 'bg-amber-600 w-6'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextCard}
            disabled={currentCard === flashcardSet.totalCards - 1}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-3 p-6 pt-0 pb-6">
          <button
            onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Study Again
          </button>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Regenerate
            </button>
          )}
          {onSave && (
            <button
              onClick={onSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Flashcards
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
