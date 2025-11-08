'use client';

import { Note } from '@/lib/store/types';
import { NoteCard } from './NoteCard';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableNoteCardProps {
  note: Note;
  onClick: () => void;
  onLinkClick: (noteId: string) => void;
  onOpenMindmap?: (noteId: string) => void;
}

export function SortableNoteCard({ note, onClick, onLinkClick, onOpenMindmap }: SortableNoteCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <NoteCard
        note={note}
        onClick={onClick}
        onLinkClick={onLinkClick}
        onOpenMindmap={onOpenMindmap}
        dragHandleProps={{ ref: setActivatorNodeRef, ...listeners }}
      />
    </div>
  );
}
