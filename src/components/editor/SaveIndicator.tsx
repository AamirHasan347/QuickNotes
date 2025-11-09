'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface SaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
}

export function SaveIndicator({ isSaving, lastSaved }: SaveIndicatorProps) {
  return (
    <AnimatePresence>
      {(isSaving || lastSaved) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className={`px-3 py-2 rounded-lg shadow-lg ${
            isSaving ? 'bg-blue-500' : 'bg-green-500'
          } text-white text-sm flex items-center gap-2`}>
            {isSaving ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
