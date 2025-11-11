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
          <Sparkles className="w-12 h-12 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome to QuickNotes
        </h1>
        <p className="text-lg text-gray-600">
          Your intelligent workspace for learning and note-taking
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 min-w-[120px]">
          <div className="text-3xl font-bold text-blue-600">{totalWorkspaces}</div>
          <div className="text-sm text-gray-600">Workspaces</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 min-w-[120px]">
          <div className="text-3xl font-bold text-green-600">{totalFolders}</div>
          <div className="text-sm text-gray-600">Folders</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 min-w-[120px]">
          <div className="text-3xl font-bold text-purple-600">{totalNotes}</div>
          <div className="text-sm text-gray-600">Notes</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
          Quick Actions
        </h3>
        <div className="flex gap-4">
          <button
            onClick={onCreateWorkspace}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FolderPlus className="w-5 h-5" />
            Create Workspace
          </button>
          <button
            disabled
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
            title="Select a workspace first"
          >
            <FileText className="w-5 h-5" />
            Create Note
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Select a workspace or folder from the sidebar to create notes
        </p>
      </div>

      {/* Recent Notes */}
      {recentNotes.length > 0 && (
        <div className="w-full max-w-2xl">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Notes
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 divide-y">
            {recentNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => onNoteClick?.(note)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between group"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate group-hover:text-blue-600">
                    {note.title || 'Untitled'}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {new Date(note.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-600 ml-2" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts */}
      <div className="mt-8 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>
            <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">
              Ctrl+K
            </kbd>{' '}
            Search
          </span>
          <span>
            <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">
              Ctrl+N
            </kbd>{' '}
            New Note
          </span>
        </div>
      </div>
    </div>
  );
}
