'use client';

import { Moon, Plus, Sun, Maximize2, Minimize2, Network } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onNewNote: () => void;
  onToggleFocus: () => void;
  isFocusMode: boolean;
  onOpenMindmap?: () => void;
}

export function Header({ onNewNote, onToggleFocus, isFocusMode, onOpenMindmap }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-[--color-text-black]">
          All Notes
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleFocus}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle focus mode"
          title="Focus Mode (Cmd+\)"
        >
          {isFocusMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        {onOpenMindmap && (
          <button
            onClick={onOpenMindmap}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open mindmap"
            title="Mindmap Editor"
          >
            <Network className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          onClick={onNewNote}
          className="flex items-center gap-2 px-4 py-2 bg-[--color-primary-blue] text-[--color-text-black] rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>
    </header>
  );
}
