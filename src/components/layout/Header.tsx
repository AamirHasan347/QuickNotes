'use client';

import { Moon, Plus, Sun, Network, PanelLeftOpen } from 'lucide-react';
import { useSettingsStore } from '@/lib/store/useSettingsStore';

interface HeaderProps {
  onNewNote: () => void;
  onOpenMindmap?: () => void;
  onToggleFocus?: () => void;
  isFocusMode?: boolean;
}

export function Header({ onNewNote, onOpenMindmap, onToggleFocus, isFocusMode }: HeaderProps) {
  const { settings, updateSettings } = useSettingsStore();

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-6"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-primary)'
      }}
    >
      <div className="flex-1">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          All Notes
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {isFocusMode && onToggleFocus && (
          <button
            onClick={onToggleFocus}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Exit focus mode"
            title="Show Sidebar (Cmd+\)"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}

        {onOpenMindmap && (
          <button
            onClick={onOpenMindmap}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Open mindmap"
            title="Mindmap Editor"
          >
            <Network className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label="Toggle theme"
        >
          {settings.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          onClick={onNewNote}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors"
          style={{
            backgroundColor: 'var(--accent-primary)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>
    </header>
  );
}
