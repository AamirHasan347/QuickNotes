'use client';

import { Note } from '@/lib/store/types';
import { Pin, Trash2, Link as LinkIcon, GripVertical, Network } from 'lucide-react';
import { useNotesStore } from '@/lib/store/useNotesStore';
import { cn } from '@/lib/utils';
import { renderContentWithLinks, extractNoteLinks } from '@/utils/noteLinks';

interface NoteCardProps {
  note: Note;
  onClick?: () => void;
  onLinkClick?: (noteId: string) => void;
  onOpenMindmap?: (noteId: string) => void;
  dragHandleProps?: any;
}

export function NoteCard({ note, onClick, onLinkClick, onOpenMindmap, dragHandleProps }: NoteCardProps) {
  const { togglePinNote, deleteNote, notes } = useNotesStore();

  const links = extractNoteLinks(note.content, notes);
  const hasLinks = links.length > 0;
  const isMindmap = note.mindmapData !== undefined;

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePinNote(note.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(note.id);
    }
  };

  const handleOpenMindmap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenMindmap) {
      onOpenMindmap(note.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-[--color-text-black] line-clamp-1">
          {note.title || 'Untitled Note'}
        </h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {dragHandleProps && (
            <button
              {...dragHandleProps}
              className="p-1.5 rounded hover:bg-gray-100 transition-colors cursor-grab active:cursor-grabbing"
              aria-label="Drag to reorder"
            >
              <GripVertical className="w-4 h-4" />
            </button>
          )}
          {isMindmap && (
            <button
              onClick={handleOpenMindmap}
              className="p-1.5 rounded hover:bg-[--color-primary-blue]/10 text-[--color-primary-blue] transition-colors"
              aria-label="Open in mindmap editor"
              title="Open in mindmap editor"
            >
              <Network className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleTogglePin}
            className={cn(
              'p-1.5 rounded hover:bg-gray-100 transition-colors',
              note.isPinned && 'text-[--color-primary-blue]'
            )}
            aria-label="Pin note"
          >
            <Pin className="w-4 h-4" fill={note.isPinned ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
            aria-label="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-600 line-clamp-3 mb-3">
        {note.content ? (
          renderContentWithLinks(note.content, notes, (noteId) => {
            onLinkClick?.(noteId);
          })
        ) : (
          'No content'
        )}
      </div>

      {hasLinks && (
        <div className="flex items-center gap-1 text-xs text-[--color-primary-blue] mb-2">
          <LinkIcon className="w-3 h-3" />
          <span>{links.length} linked note{links.length > 1 ? 's' : ''}</span>
        </div>
      )}

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs bg-[--color-accent-green] text-[--color-text-black] rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-400">
        {new Date(note.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
