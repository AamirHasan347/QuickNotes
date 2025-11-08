'use client';

import { useNotesStore } from '@/lib/store/useNotesStore';
import { NoteCard } from './NoteCard';
import { SortableNoteCard } from './SortableNoteCard';
import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Note } from '@/lib/store/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

interface NotesListProps {
  onNoteClick: (note: Note) => void;
  onOpenMindmap?: (noteId: string) => void;
}

export function NotesList({ onNoteClick, onOpenMindmap }: NotesListProps) {
  const [isClient, setIsClient] = useState(false);
  const { getFilteredNotes, getPinnedNotes, notes, reorderNotes } = useNotesStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleLinkClick = (noteId: string) => {
    const linkedNote = notes.find(n => n.id === noteId);
    if (linkedNote) {
      onNoteClick(linkedNote);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = notes.findIndex((note) => note.id === active.id);
      const newIndex = notes.findIndex((note) => note.id === over.id);

      const reordered = arrayMove(notes, oldIndex, newIndex);
      reorderNotes(reordered);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Loading...
        </h3>
      </div>
    );
  }

  const pinnedNotes = getPinnedNotes();
  const allNotes = getFilteredNotes();
  const unpinnedNotes = allNotes.filter(note => !note.isPinned);

  if (allNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No notes yet
        </h3>
        <p className="text-gray-500">
          Create your first note to get started
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {pinnedNotes.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Pinned
            </h2>
            <SortableContext items={pinnedNotes.map(n => n.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map((note) => (
                  <SortableNoteCard
                    key={note.id}
                    note={note}
                    onClick={() => onNoteClick(note)}
                    onLinkClick={handleLinkClick}
                    onOpenMindmap={onOpenMindmap}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        )}

        {unpinnedNotes.length > 0 && (
          <div>
            {pinnedNotes.length > 0 && (
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                All Notes
              </h2>
            )}
            <SortableContext items={unpinnedNotes.map(n => n.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unpinnedNotes.map((note) => (
                  <SortableNoteCard
                    key={note.id}
                    note={note}
                    onClick={() => onNoteClick(note)}
                    onLinkClick={handleLinkClick}
                    onOpenMindmap={onOpenMindmap}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        )}
      </div>
    </DndContext>
  );
}
