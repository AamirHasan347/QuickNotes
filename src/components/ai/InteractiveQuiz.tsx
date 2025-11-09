'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, RefreshCw, Check, XCircle, HelpCircle, Trophy } from 'lucide-react';
import { Quiz } from '@/lib/ai/types';

interface InteractiveQuizProps {
  quiz: Quiz;
  onClose: () => void;
  onRegenerate?: () => void;
  onSave?: () => void;
}

interface QuestionState {
  selectedAnswer: number | null;
  isAnswered: boolean;
  isCorrect: boolean;
  showExplanation: boolean;
}

export function InteractiveQuiz({ quiz, onClose, onRegenerate, onSave }: InteractiveQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    quiz.flashcards.map(() => ({
      selectedAnswer: null,
      isAnswered: false,
      isCorrect: false,
      showExplanation: false,
    }))
  );
  const [isComplete, setIsComplete] = useState(false);

  const card = quiz.flashcards[currentQuestion];
  const state = questionStates[currentQuestion];

  // Use options from AI or generate fallback
  const options = card.options || [card.answer, '...', '...', '...'];
  const correctAnswerIndex = card.correctAnswerIndex ?? 0;

  const handleSelectAnswer = (index: number) => {
    if (state.isAnswered) return;

    const isCorrect = index === correctAnswerIndex;
    const newStates = [...questionStates];
    newStates[currentQuestion] = {
      selectedAnswer: index,
      isAnswered: true,
      isCorrect,
      showExplanation: true,
    };
    setQuestionStates(newStates);
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.flashcards.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsComplete(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    const correct = questionStates.filter(s => s.isCorrect).length;
    return Math.round((correct / quiz.flashcards.length) * 100);
  };

  const getOptionColor = (index: number) => {
    if (!state.isAnswered) return 'bg-white hover:bg-purple-50 border-gray-200';
    if (index === correctAnswerIndex) return 'bg-green-100 border-green-400';
    if (index === state.selectedAnswer && !state.isCorrect) return 'bg-red-100 border-red-400';
    return 'bg-gray-50 border-gray-200';
  };

  if (isComplete) {
    const score = calculateScore();
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 text-center"
        >
          <div className="mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
            <p className="text-gray-600">Here's how you did:</p>
          </div>

          <div className="mb-8">
            <div className="text-6xl font-bold text-purple-600 mb-2">{score}%</div>
            <p className="text-lg text-gray-700">
              {questionStates.filter(s => s.isCorrect).length} out of {quiz.flashcards.length} correct
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onRegenerate}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
            {onSave && (
              <button
                onClick={onSave}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Quiz
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{quiz.title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Question {currentQuestion + 1} of {quiz.flashcards.length}
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
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / quiz.flashcards.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Difficulty Badge */}
              {card.difficulty && (
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    card.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    card.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {card.difficulty.toUpperCase()}
                  </span>
                </div>
              )}

              {/* Question */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {card.question}
                </h3>
                {card.hint && !state.isAnswered && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Hint:</span> {card.hint}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={state.isAnswered}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${getOptionColor(index)} ${
                      state.isAnswered ? 'cursor-default' : 'cursor-pointer'
                    }`}
                    whileHover={!state.isAnswered ? { scale: 1.02 } : {}}
                    whileTap={!state.isAnswered ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        state.isAnswered && index === correctAnswerIndex ? 'bg-green-500 text-white' :
                        state.isAnswered && index === state.selectedAnswer && !state.isCorrect ? 'bg-red-500 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {state.isAnswered && index === correctAnswerIndex ? (
                          <Check className="w-5 h-5" />
                        ) : state.isAnswered && index === state.selectedAnswer && !state.isCorrect ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {state.showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 rounded-xl ${
                      state.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {state.isCorrect ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-semibold mb-1 ${state.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                          {state.isCorrect ? 'Correct!' : 'Incorrect'}
                        </p>
                        {!state.isCorrect && (
                          <p className="text-red-700 mb-2">
                            <span className="font-medium">Correct answer:</span> {card.answer}
                          </p>
                        )}
                        {card.explanation && (
                          <p className={state.isCorrect ? 'text-green-700' : 'text-red-700'}>
                            {card.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-2">
            {quiz.flashcards.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  questionStates[index].isAnswered
                    ? questionStates[index].isCorrect
                      ? 'bg-green-500 w-3 h-3'
                      : 'bg-red-500 w-3 h-3'
                    : index === currentQuestion
                    ? 'bg-purple-600 w-6'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextQuestion}
            disabled={!state.isAnswered}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === quiz.flashcards.length - 1 ? 'Finish' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
