'use client';

import { useNotesStore } from '@/lib/store/useNotesStore';
import { useSmartWorkspaceStore } from '@/lib/store/useSmartWorkspaceStore';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
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
  const { getNotesInWorkspace, getNotesInFolder, notes, reorderNotes } = useNotesStore();
  const { activeWorkspaceId, activeFolderId } = useSmartWorkspaceStore();
  const { settings } = useSettingsStore();

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
        <FileText className="w-16 h-16 mb-4" style={{ color: 'var(--text-tertiary)' }} />
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
          Loading...
        </h3>
      </div>
    );
  }

  // Get notes based on active context
  let allNotes: Note[] = [];

  if (activeFolderId) {
    // Folder selected: show only notes in that folder
    allNotes = getNotesInFolder(activeFolderId);
  } else if (activeWorkspaceId) {
    // Workspace selected (no folder): show all notes in workspace (root + all folders)
    allNotes = getNotesInWorkspace(activeWorkspaceId);
  }
  // If neither is selected, allNotes remains empty (splash screen will show)

  // Apply sorting based on settings
  const sortedNotes = [...allNotes].sort((a, b) => {
    let comparison = 0;

    switch (settings.sortBy) {
      case 'updated':
        comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        break;
      case 'created':
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      default:
        comparison = 0;
    }

    // Apply sort order (asc or desc)
    return settings.sortOrder === 'asc' ? -comparison : comparison;
  });

  const pinnedNotes = sortedNotes.filter(note => note.isPinned);
  const unpinnedNotes = sortedNotes.filter(note => !note.isPinned);

  if (allNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center">
        <FileText className="w-16 h-16 mb-4" style={{ color: 'var(--text-tertiary)' }} />
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
          No notes yet
        </h3>
        <p style={{ color: 'var(--text-tertiary)' }}>
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
        {settings.showPinned ? (
          // Show pinned notes in separate section
          <>
            {pinnedNotes.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
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
                  <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
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
          </>
        ) : (
          // Don't show pinned section separately - combine all notes
          <div>
            <SortableContext items={sortedNotes.map(n => n.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedNotes.map((note) => (
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
