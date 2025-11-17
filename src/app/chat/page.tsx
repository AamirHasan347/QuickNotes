'use client';

import { useEffect, useState } from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useNotesStore } from '@/lib/store/useNotesStore';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, AlertCircle } from 'lucide-react';

export default function ChatPage() {
  const { getAllNotes } = useNotesStore();
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get all notes for the AI to analyze
    try {
      const allNotes = getAllNotes();

      // Format notes for the AI
      const formattedNotes = allNotes.map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        tags: note.tags || [],
      }));

      setNotes(formattedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAllNotes]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8f8f8] dark:bg-gray-900">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="inline-block w-12 h-12 border-4 border-[#63cdff] border-t-transparent rounded-full"
          />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#63cdff] to-[#8ef292] flex items-center justify-center">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#121421] dark:text-white">
                AI Study Assistant
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ask questions about your notes
              </p>
            </div>
          </div>

          {/* Notes Counter */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#e4f6e5] dark:bg-gray-700 rounded-full">
            <FileText size={16} className="text-[#8ef292] dark:text-[#8ef292]" />
            <span className="text-sm font-medium text-[#121421] dark:text-white">
              {notes.length} {notes.length === 1 ? 'Note' : 'Notes'} Loaded
            </span>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <main className="flex-1 overflow-hidden">
        {notes.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-[#f8f8f8] dark:bg-gray-900">
            <div className="text-center max-w-md px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
                <AlertCircle size={32} className="text-yellow-600 dark:text-yellow-500" />
              </div>
              <h2 className="text-xl font-bold text-[#121421] dark:text-white mb-2">
                No Notes Available
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create some notes first to start chatting with the AI assistant.
                The AI uses your notes to answer questions and provide insights.
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#63cdff] text-white rounded-lg
                  hover:bg-[#4ab8ec] transition-colors duration-200 font-medium"
              >
                <FileText size={20} />
                Create Your First Note
              </a>
            </div>
          </div>
        ) : (
          <ChatInterface notes={notes} />
        )}
      </main>
    </div>
  );
}
