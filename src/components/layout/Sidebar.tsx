'use client';

import { useNotesStore } from '@/lib/store/useNotesStore';
import { useSmartWorkspaceStore } from '@/lib/store/useSmartWorkspaceStore';
import { Search, Settings, Calendar, ChevronLeft, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SmartWorkspaceTree } from '@/components/workspace/SmartWorkspaceTree';
import { motion } from 'framer-motion';

interface SidebarProps {
  onSearchClick: () => void;
  onTodayClick: () => void;
  onToggleFocus: () => void;
  isFocusMode: boolean;
}

export function Sidebar({ onSearchClick, onTodayClick, onToggleFocus, isFocusMode }: SidebarProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { getTodayNote, createTodayNote } = useNotesStore();
  const { workspaces, activeWorkspaceId } = useSmartWorkspaceStore();

  const handleTodayClick = () => {
    const todayNote = getTodayNote() || createTodayNote();
    onTodayClick();
  };

  // Get active workspace for background color
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <aside
      className="w-64 h-screen flex flex-col relative overflow-hidden"
      style={{ borderRight: '1px solid var(--border-primary)' }}
    >
      <motion.div
        animate={{
          backgroundColor: activeWorkspace ? `${activeWorkspace.color}08` : 'var(--bg-secondary)',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute inset-0 -z-10"
      />
      <div className="relative z-10 h-full flex flex-col">
      {/* Focus Mode Toggle - Right Edge */}
      <button
        onClick={onToggleFocus}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 rounded-r-lg p-2 shadow-md transition-all"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-secondary)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
        aria-label="Toggle focus mode"
        title="Focus Mode (Cmd+\)"
      >
        <ChevronLeft
          className={cn(
            "w-5 h-5 transition-transform duration-300",
            isFocusMode && "rotate-180"
          )}
        />
      </button>

      {/* Header */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          QuickNotes
        </h1>
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={onSearchClick}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
          style={{
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-tertiary)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
        >
          <Search className="w-4 h-4" />
          <span>Search notes...</span>
          <kbd
            className="ml-auto text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-tertiary)'
            }}
          >
            ⌘K
          </kbd>
        </button>

        <button
          onClick={handleTodayClick}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
          style={{
            color: 'var(--text-secondary)',
            background: 'linear-gradient(to right, rgba(99, 205, 255, 0.1), rgba(142, 242, 146, 0.1))'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, rgba(99, 205, 255, 0.2), rgba(142, 242, 146, 0.2))'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, rgba(99, 205, 255, 0.1), rgba(142, 242, 146, 0.1))'}
        >
          <Calendar className="w-4 h-4" />
          <span>Today's Note</span>
        </button>

        <button
          onClick={() => router.push('/chat')}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
          style={{
            color: 'var(--text-secondary)',
            background: 'linear-gradient(to right, rgba(142, 242, 146, 0.1), rgba(99, 205, 255, 0.1))'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, rgba(142, 242, 146, 0.2), rgba(99, 205, 255, 0.2))'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, rgba(142, 242, 146, 0.1), rgba(99, 205, 255, 0.1))'}
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI Chat</span>
        </button>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Smart Workspaces Tree */}
        <div className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-tertiary)' }}>
            Smart Workspaces
          </h2>
          <SmartWorkspaceTree />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <button
          onClick={() => router.push('/settings')}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
      </div>
    </aside>
  );
}
