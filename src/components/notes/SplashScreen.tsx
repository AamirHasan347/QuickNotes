'use client';

import { useSmartWorkspaceStore } from '@/lib/store/useSmartWorkspaceStore';
import { useNotesStore } from '@/lib/store/useNotesStore';
import { FolderPlus, FileText, Clock, Sparkles } from 'lucide-react';
import { Note } from '@/lib/store/types';

interface SplashScreenProps {
  onNoteClick?: (note: Note) => void;
  onCreateWorkspace?: () => void;
}

export function SplashScreen({ onNoteClick, onCreateWorkspace }: SplashScreenProps) {
  const { workspaces, folders, setActiveWorkspace } = useSmartWorkspaceStore();
  const { notes } = useNotesStore();

  // Get recent notes (last 5)
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Stats
  const totalWorkspaces = workspaces.length;
  const totalFolders = folders.length;
  const totalNotes = notes.length;

  const handleQuickWorkspaceAccess = (workspaceId: string) => {
    setActiveWorkspace(workspaceId);
  };

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center p-8 animate-in fade-in duration-300">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-12 h-12" style={{ color: 'var(--accent-primary)' }} />
        </div>
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Welcome to QuickNotes
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Your intelligent workspace for learning and note-taking
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-8">
        <div className="rounded-lg p-4 min-w-[120px]" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          <div className="text-3xl font-bold" style={{ color: 'var(--accent-primary)' }}>{totalWorkspaces}</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Workspaces</div>
        </div>
        <div className="rounded-lg p-4 min-w-[120px]" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          <div className="text-3xl font-bold" style={{ color: 'var(--accent-primary)' }}>{totalFolders}</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Folders</div>
        </div>
        <div className="rounded-lg p-4 min-w-[120px]" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          <div className="text-3xl font-bold" style={{ color: 'var(--accent-primary)' }}>{totalNotes}</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Notes</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold uppercase mb-4" style={{ color: 'var(--text-tertiary)' }}>
          Quick Actions
        </h3>
        <div className="flex gap-4">
          <button
            onClick={onCreateWorkspace}
            className="flex items-center gap-2 px-6 py-3 rounded-lg transition-colors shadow-sm text-white"
            style={{ backgroundColor: 'var(--accent-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
          >
            <FolderPlus className="w-5 h-5" />
            Create Workspace
          </button>
          <button
            disabled
            className="flex items-center gap-2 px-6 py-3 rounded-lg cursor-not-allowed"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}
            title="Select a workspace first"
          >
            <FileText className="w-5 h-5" />
            Create Note
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
          Select a workspace or folder from the sidebar to create notes
        </p>
      </div>

      {/* Recent Notes */}
      {recentNotes.length > 0 && (
        <div className="w-full max-w-2xl">
          <h3 className="text-sm font-semibold uppercase mb-3 flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
            <Clock className="w-4 h-4" />
            Recent Notes
          </h3>
          <div className="rounded-lg divide-y" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
            {recentNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => onNoteClick?.(note)}
                className="w-full text-left px-4 py-3 transition-colors flex items-center justify-between group"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {note.title || 'Untitled'}
                  </div>
                  <div className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(note.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <FileText className="w-4 h-4 ml-2" style={{ color: 'var(--text-tertiary)' }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts */}
      <div className="mt-8 text-xs" style={{ color: 'var(--text-tertiary)' }}>
        <div className="flex items-center gap-4">
          <span>
            <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
              Ctrl+K
            </kbd>{' '}
            Search
          </span>
          <span>
            <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
              Ctrl+N
            </kbd>{' '}
            New Note
          </span>
        </div>
      </div>
    </div>
  );
}
