'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Search, FileText } from 'lucide-react';
import { useNotesStore } from '@/lib/store/useNotesStore';
import { Note } from '@/lib/store/types';
import MiniSearch from 'minisearch';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (note: Note) => void;
}

export function SearchModal({ isOpen, onClose, onSelectNote }: SearchModalProps) {
  const { notes } = useNotesStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Note[]>([]);

  // Initialize MiniSearch
  const miniSearch = useMemo(() => {
    const ms = new MiniSearch({
      fields: ['title', 'content', 'tags'],
      storeFields: ['id', 'title', 'content', 'tags', 'isPinned', 'workspaceId', 'createdAt', 'updatedAt'],
      searchOptions: {
        boost: { title: 2 },
        fuzzy: 0.2,
        prefix: true,
      },
    });

    if (notes.length > 0) {
      ms.addAll(notes);
    }

    return ms;
  }, [notes]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      try {
        const searchResults = miniSearch.search(query);
        const foundNotes = searchResults.map((result: any) => ({
          id: result.id,
          title: result.title,
          content: result.content,
          tags: result.tags,
          isPinned: result.isPinned,
          workspaceId: result.workspaceId,
          createdAt: new Date(result.createdAt),
          updatedAt: new Date(result.updatedAt),
        }));
        setResults(foundNotes);
      } catch (error) {
        setResults([]);
      }
    } else {
      setResults(notes.slice(0, 5)); // Show recent notes when no query
    }
  }, [query, notes, miniSearch]);

  const handleSelectNote = (note: Note) => {
    onSelectNote(note);
    onClose();
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50">
      <div className="rounded-lg shadow-xl w-full max-w-2xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <Search className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search notes by title, content, or tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-lg outline-none"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              caretColor: 'var(--text-primary)'
            }}
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-2">
              {!query && (
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  Recent Notes
                </div>
              )}
              {results.map((note) => (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className="w-full flex items-start gap-3 px-4 py-3 transition-colors text-left"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <FileText className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {note.title || 'Untitled Note'}
                    </h3>
                    <p className="text-sm line-clamp-2 mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {note.content || 'No content'}
                    </p>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs rounded"
                            style={{
                              backgroundColor: '#e4f6e5',
                              color: '#121421'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--text-tertiary)' }}>
              <FileText className="w-12 h-12 mb-3" />
              <p>No notes found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 text-xs" style={{
          borderTop: '1px solid var(--border-primary)',
          color: 'var(--text-tertiary)'
        }}>
          <kbd className="px-1.5 py-0.5 rounded" style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-primary)'
          }}>ESC</kbd> to close
        </div>
      </div>
    </div>
  );
}
