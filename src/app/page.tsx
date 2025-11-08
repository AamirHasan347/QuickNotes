'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { NotesList } from '@/components/notes/NotesList';
import { NoteEditor } from '@/components/editor/NoteEditor';
import { SearchModal } from '@/components/layout/SearchModal';
import { MindmapEditor } from '@/components/mindmap/MindmapEditor';
import { useState, useEffect } from 'react';
import { Note } from '@/lib/store/types';
import { useNotesStore } from '@/lib/store/useNotesStore';

export default function Home() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMindmapOpen, setIsMindmapOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const { getTodayNote, createTodayNote } = useNotesStore();

  const handleOpenEditor = (note?: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingNote(undefined);
  };

  // Handle Cmd+K / Ctrl+K for search, Cmd+\ for focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setIsFocusMode(!isFocusMode);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  return (
    <div className="flex h-screen bg-[--color-cream] relative">
      {/* Focus Mode Overlay */}
      {isFocusMode && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 pointer-events-none" />
      )}

      {/* Sidebar - hidden in focus mode */}
      <div className={`transition-all duration-300 ${isFocusMode ? 'w-0 overflow-hidden' : 'w-64'}`}>
        <Sidebar
          onSearchClick={() => setIsSearchOpen(true)}
          onTodayClick={() => {
            const todayNote = getTodayNote() || createTodayNote();
            handleOpenEditor(todayNote);
          }}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative z-20">
        <Header
          onNewNote={() => handleOpenEditor()}
          onToggleFocus={() => setIsFocusMode(!isFocusMode)}
          isFocusMode={isFocusMode}
          onOpenMindmap={() => setIsMindmapOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <NotesList onNoteClick={handleOpenEditor} />
        </main>
      </div>

      <NoteEditor
        note={editingNote}
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectNote={handleOpenEditor}
      />

      <MindmapEditor
        isOpen={isMindmapOpen}
        onClose={() => setIsMindmapOpen(false)}
      />
    </div>
  );
}
