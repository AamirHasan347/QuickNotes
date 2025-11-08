'use client';

import { useState, useEffect } from 'react';
import { useNotesStore } from '@/lib/store/useNotesStore';
import { X } from 'lucide-react';
import { Note } from '@/lib/store/types';
import { VersionHistory } from './VersionHistory';

interface NoteEditorProps {
  note?: Note;
  isOpen: boolean;
  onClose: () => void;
}

export function NoteEditor({ note, isOpen, onClose }: NoteEditorProps) {
  const { addNote, updateNote, activeWorkspaceId } = useNotesStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setTags(note.tags);
      } else {
        setTitle('');
        setContent('');
        setTags([]);
      }
      setTagInput('');
    }
  }, [note, isOpen]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      return;
    }

    if (note) {
      updateNote(note.id, {
        title,
        content,
        tags,
      });
    } else {
      addNote({
        title,
        content,
        tags,
        isPinned: false,
        workspaceId: activeWorkspaceId || undefined,
      });
    }

    onClose();
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[--color-text-black]">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          <div className="flex items-center gap-2">
            {note && <VersionHistory noteId={note.id} />}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-bold text-[--color-text-black] placeholder-gray-400 border-none outline-none"
          />

          <textarea
            placeholder="Start writing your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[300px] text-gray-700 placeholder-gray-400 border-none outline-none resize-none"
          />

          <div>
            <input
              type="text"
              placeholder="Add tags (press Enter)..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[--color-primary-blue] transition-colors"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[--color-accent-green] text-[--color-text-black] rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[--color-primary-blue] text-[--color-text-black] rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            {note ? 'Update' : 'Create'} Note
          </button>
        </div>
      </div>
    </div>
  );
}
