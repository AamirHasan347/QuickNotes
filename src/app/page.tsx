'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { NotesList } from '@/components/notes/NotesList';
import { SplashScreen } from '@/components/notes/SplashScreen';
import { EnhancedNoteEditor } from '@/components/editor/EnhancedNoteEditor';
import { SearchModal } from '@/components/layout/SearchModal';
import { MindmapEditor } from '@/components/mindmap/MindmapEditor';
import { MigrationChecker } from '@/components/migrations/MigrationChecker';
import { useState, useEffect } from 'react';
import { Note } from '@/lib/store/types';
import { useNotesStore } from '@/lib/store/useNotesStore';
import { useSmartWorkspaceStore } from '@/lib/store/useSmartWorkspaceStore';

export default function Home() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMindmapOpen, setIsMindmapOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [existingMindmap, setExistingMindmap] = useState<any>(undefined);

  const { getTodayNote, createTodayNote, notes, addNote } = useNotesStore();
  const { activeWorkspaceId, activeFolderId } = useSmartWorkspaceStore();

  const [showAddWorkspaceModal, setShowAddWorkspaceModal] = useState(false);

  const handleOpenEditor = (note?: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleNewNote = () => {
    // Create note with correct context based on selection
    const newNoteData: any = {
      title: '',
      content: '',
      tags: [],
      isPinned: false,
    };

    // If folder is selected, note belongs to that folder
    if (activeFolderId) {
      newNoteData.folderId = activeFolderId;
    }
    // If only workspace is selected, note belongs to workspace root
    else if (activeWorkspaceId) {
      newNoteData.workspaceId = activeWorkspaceId;
    }
    // If nothing is selected, don't create note (should prompt user)
    else {
      alert('Please select a workspace or folder first');
      return;
    }

    // Add the note to the store and get the created note
    const createdNote = addNote(newNoteData);

    // Open the editor with the new note
    handleOpenEditor(createdNote);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingNote(undefined);
  };

  const handleOpenMindmap = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note?.mindmapData) {
      setExistingMindmap({
        noteId: note.id,
        nodes: note.mindmapData.nodes,
        edges: note.mindmapData.edges,
      });
      setIsMindmapOpen(true);
    }
  };

  const handleCloseMindmap = () => {
    setIsMindmapOpen(false);
    setExistingMindmap(undefined);
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
      {/* Sidebar - hidden in focus mode */}
      <div className={`relative transition-all duration-500 ease-in-out ${isFocusMode ? 'w-0' : 'w-64'} overflow-hidden`}>
        <div className="w-64">
          <Sidebar
            onSearchClick={() => setIsSearchOpen(true)}
            onTodayClick={() => {
              const todayNote = getTodayNote() || createTodayNote();
              handleOpenEditor(todayNote);
            }}
            onToggleFocus={() => setIsFocusMode(!isFocusMode)}
            isFocusMode={isFocusMode}
          />
        </div>

        {/* Focus Mode Overlay - Only on sidebar */}
        {isFocusMode && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-none" />
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onNewNote={handleNewNote}
          onOpenMindmap={() => setIsMindmapOpen(true)}
          onToggleFocus={() => setIsFocusMode(!isFocusMode)}
          isFocusMode={isFocusMode}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {!activeWorkspaceId && !activeFolderId ? (
            <SplashScreen
              onNoteClick={handleOpenEditor}
              onCreateWorkspace={() => setShowAddWorkspaceModal(true)}
            />
          ) : (
            <NotesList
              onNoteClick={handleOpenEditor}
              onOpenMindmap={handleOpenMindmap}
            />
          )}
        </main>
      </div>

      <EnhancedNoteEditor
        note={editingNote}
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        isFocusMode={isFocusMode}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectNote={handleOpenEditor}
      />

      <MindmapEditor
        isOpen={isMindmapOpen}
        onClose={handleCloseMindmap}
        existingMindmap={existingMindmap}
      />

      {/* Migration Checker - Runs on app startup */}
      <MigrationChecker />
    </div>
  );
}
