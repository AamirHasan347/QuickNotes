'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Network, Loader2 } from 'lucide-react';

interface OrganizingModalProps {
  isOpen: boolean;
  stage: 'analyzing' | 'clustering' | 'organizing' | 'complete';
  progress: number; // 0-100
  clustersFound?: number;
}

export function OrganizingModal({ isOpen, stage, progress, clustersFound }: OrganizingModalProps) {
  const getStageText = () => {
    switch (stage) {
      case 'analyzing':
        return 'Analyzing your ideas...';
      case 'clustering':
        return 'Finding patterns & relationships...';
      case 'organizing':
        return 'Rearranging into clusters...';
      case 'complete':
        return 'All done! ✨';
      default:
        return 'Working...';
    }
  };

  const getStageIcon = () => {
    switch (stage) {
      case 'analyzing':
        return <Loader2 className="w-8 h-8 animate-spin text-[--color-primary-blue]" />;
      case 'clustering':
        return <Network className="w-8 h-8 text-[--color-primary-green]" />;
      case 'organizing':
        return <Sparkles className="w-8 h-8 text-[--color-primary-blue]" />;
      case 'complete':
        return <Sparkles className="w-8 h-8 text-[--color-primary-green]" />;
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
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 pointer-events-auto">
              {/* Icon with pulse animation */}
              <motion.div
                animate={{
                  scale: stage === 'complete' ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 0.5 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  {getStageIcon()}
                  {stage !== 'complete' && (
                    <motion.div
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[--color-primary-blue] to-[--color-primary-green] blur-xl"
                    />
                  )}
                </div>
              </motion.div>

              {/* Text */}
              <motion.h3
                key={stage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-semibold text-center text-[--color-text-black] mb-2"
              >
                {getStageText()}
              </motion.h3>

              {clustersFound !== undefined && stage === 'complete' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center text-gray-600 mb-4"
                >
                  Found {clustersFound} meaningful {clustersFound === 1 ? 'cluster' : 'clusters'}
                </motion.p>
              )}

              {/* Progress bar */}
              {stage !== 'complete' && (
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-[--color-primary-blue] to-[--color-primary-green] rounded-full"
                  />
                </div>
              )}

              {/* Breathing particle effect */}
              {stage !== 'complete' && (
                <div className="mt-6 flex justify-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      className="w-2 h-2 rounded-full bg-gradient-to-r from-[--color-primary-blue] to-[--color-primary-green]"
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
