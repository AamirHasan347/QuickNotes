'use client';

import { useNotesStore } from '@/lib/store/useNotesStore';
import { Book, Plus, Search, Settings, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { WorkspaceModal } from './WorkspaceModal';

interface SidebarProps {
  onSearchClick: () => void;
  onTodayClick: () => void;
}

export function Sidebar({ onSearchClick, onTodayClick }: SidebarProps) {
  const [isClient, setIsClient] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const { workspaces, activeWorkspaceId, setActiveWorkspace, getTodayNote, createTodayNote } = useNotesStore();

  const handleTodayClick = () => {
    const todayNote = getTodayNote() || createTodayNote();
    onTodayClick();
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[--color-text-black]">
          QuickNotes
        </h1>
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={onSearchClick}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Search notes...</span>
          <kbd className="ml-auto text-xs bg-white px-1.5 py-0.5 rounded border">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={handleTodayClick}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gradient-to-r from-[--color-primary-blue]/10 to-[--color-primary-green]/10 rounded-lg hover:from-[--color-primary-blue]/20 hover:to-[--color-primary-green]/20 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span>Today's Note</span>
        </button>
      </div>

      {/* Workspaces */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Workspaces
            </h2>
            <button
              onClick={() => setIsWorkspaceModalOpen(true)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Add workspace"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveWorkspace(null)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isClient && activeWorkspaceId === null
                  ? 'bg-[--color-accent-green] text-[--color-text-black] font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Book className="w-4 h-4" />
              <span>All Notes</span>
            </button>

            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => setActiveWorkspace(workspace.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  isClient && activeWorkspaceId === workspace.id
                    ? 'bg-[--color-accent-green] text-[--color-text-black] font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: workspace.color }}
                />
                <span>{workspace.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
      />
    </aside>
  );
}
