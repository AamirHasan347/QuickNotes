'use client';

import { useRef, useState, useEffect, ReactElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useNotesStore } from '@/lib/store/useNotesStore';
import { useSettingsStore } from '@/lib/store/useSettingsStore';

interface NoteLinkParserProps {
  content: string;
  onLinkClick: (noteId: string) => void;
}

interface LinkMatch {
  text: string;
  noteTitle: string;
  start: number;
  end: number;
}

export function NoteLinkParser({ content, onLinkClick }: NoteLinkParserProps) {
  const { notes } = useNotesStore();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [linkPosition, setLinkPosition] = useState({ x: 0, y: 0 });

  // Parse [[note]] syntax
  const parseLinks = (text: string): (string | ReactElement)[] => {
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    const parts: (string | ReactElement)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      const linkTitle = match[1];
      const linkedNote = notes.find(
        (n) => n.title.toLowerCase() === linkTitle.toLowerCase()
      );

      if (linkedNote) {
        parts.push(
          <span
            key={match.index}
            className="inline-flex items-center gap-1 cursor-pointer underline decoration-dotted underline-offset-2 transition-colors"
            style={{ color: 'var(--accent-primary)' }}
            onClick={() => onLinkClick(linkedNote.id)}
            onMouseEnter={(e) => {
              setHoveredLink(linkedNote.id);
              const rect = e.currentTarget.getBoundingClientRect();
              setLinkPosition({ x: rect.left, y: rect.bottom + 5 });
            }}
            onMouseLeave={() => setHoveredLink(null)}
          >
            <LinkIcon className="w-3 h-3" />
            {linkTitle}
          </span>
        );
      } else {
        // Note doesn't exist
        parts.push(
          <span
            key={match.index}
            className="line-through"
            style={{ color: 'var(--text-tertiary)' }}
            title="Note not found"
          >
            {linkTitle}
          </span>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  const hoveredNote = hoveredLink
    ? notes.find((n) => n.id === hoveredLink)
    : null;

  return (
    <>
      <div className="whitespace-pre-wrap">{parseLinks(content)}</div>

      {/* Hover Preview Tooltip */}
      <AnimatePresence>
        {hoveredNote && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              left: linkPosition.x,
              top: linkPosition.y,
              zIndex: 1000,
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)'
            }}
            className="w-80 max-w-sm rounded-lg shadow-2xl p-4"
          >
            <div className="flex items-start gap-2 mb-2">
              <ExternalLink className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} />
              <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {hoveredNote.title}
              </h4>
            </div>
            <p className="text-xs line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
              {hoveredNote.content || 'Empty note'}
            </p>
            {hoveredNote.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {hoveredNote.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: 'var(--accent-light)',
                      color: 'var(--accent-primary)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
              Click to open
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface NoteLinkInputProps {
  value: string;
  onChange: (value: string) => void;
  onLinkInsert?: (noteTitle: string) => void;
}

export function NoteLinkInput({ value, onChange, onLinkInsert }: NoteLinkInputProps) {
  const { notes } = useNotesStore();
  const { settings } = useSettingsStore();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Detect [[ to show autocomplete
    const beforeCursor = value.slice(0, cursorPosition);
    const match = beforeCursor.match(/\[\[([^\]]*?)$/);

    if (match) {
      setSearchQuery(match[1]);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [value, cursorPosition]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '[' && e.shiftKey) {
      // User typed [[
      const { selectionStart } = e.currentTarget;
      setCursorPosition(selectionStart + 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  // Debug: Log when selection changes
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const selectedText = target.value.substring(target.selectionStart, target.selectionEnd);
  };

  const insertLink = (noteTitle: string) => {
    const beforeCursor = value.slice(0, cursorPosition);
    const afterCursor = value.slice(cursorPosition);
    const beforeLink = beforeCursor.replace(/\[\[([^\]]*?)$/, '');
    const newValue = `${beforeLink}[[${noteTitle}]]${afterCursor}`;

    onChange(newValue);
    setShowSuggestions(false);
    onLinkInsert?.(noteTitle);

    // Focus back on input
    setTimeout(() => {
      if (inputRef.current) {
        const newPosition = beforeLink.length + noteTitle.length + 4; // +4 for [[]]
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative h-full">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        spellCheck={settings.spellCheck}
        className="w-full h-full text-base leading-relaxed border-none outline-none resize-none bg-transparent focus:outline-none"
        placeholder="Start writing your note... Type [[ to link to another note"
        style={{
          userSelect: 'text',
          color: 'var(--text-primary)',
          caretColor: 'var(--text-primary)'
        }}
      />

      {/* Autocomplete Suggestions */}
      <AnimatePresence>
        {showSuggestions && filteredNotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-64 rounded-lg shadow-xl max-h-60 overflow-y-auto"
            style={{
              top: '100px',
              left: '20px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <div className="p-2">
              <p className="text-xs px-2 py-1" style={{ color: 'var(--text-tertiary)' }}>Link to note:</p>
              {filteredNotes.slice(0, 5).map((note) => (
                <button
                  key={note.id}
                  onClick={() => insertLink(note.title)}
                  className="w-full text-left px-3 py-2 rounded-lg transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{note.title}</p>
                  {note.tags.length > 0 && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {note.tags.join(', ')}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
