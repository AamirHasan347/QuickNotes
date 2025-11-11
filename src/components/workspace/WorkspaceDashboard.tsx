'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  FolderOpen,
  Clock,
  TrendingUp,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useNotesStore } from '@/lib/store/useNotesStore';
import { useSmartWorkspaceStore } from '@/lib/store/useSmartWorkspaceStore';

interface WorkspaceDashboardProps {
  workspaceId: string;
}

export function WorkspaceDashboard({ workspaceId }: WorkspaceDashboardProps) {
  const { notes } = useNotesStore();
  const { workspaces, folders, getWorkspaceFolders } = useSmartWorkspaceStore();

  const workspace = workspaces.find((w) => w.id === workspaceId);
  const workspaceFolders = getWorkspaceFolders(workspaceId);

  // Calculate workspace statistics
  const stats = useMemo(() => {
    // Get all notes in folders belonging to this workspace
    const workspaceFolderIds = workspaceFolders.map((f) => f.id);
    const workspaceNotes = notes.filter(
      (note) => note.folderId && workspaceFolderIds.includes(note.folderId)
    );

    // Get most recently updated note
    const recentNotes = [...workspaceNotes].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Get notes from the last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const recentActivity = workspaceNotes.filter(
      (note) => new Date(note.updatedAt) >= lastWeek
    );

    return {
      totalNotes: workspaceNotes.length,
      totalFolders: workspaceFolders.length,
      lastModified: recentNotes[0],
      recentActivity: recentActivity.length,
      pinnedNotes: workspaceNotes.filter((n) => n.isPinned).length,
    };
  }, [notes, workspaceId, workspaceFolders]);

  if (!workspace) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${workspace.color}20` }}
        >
          {workspace.icon || '📁'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
          <p className="text-sm text-gray-500">
            Last updated{' '}
            {stats.lastModified
              ? new Date(stats.lastModified.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Never'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Notes */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${workspace.color}20` }}
            >
              <FileText className="w-5 h-5" style={{ color: workspace.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalNotes}</p>
              <p className="text-xs text-gray-500">Total Notes</p>
            </div>
          </div>
        </motion.div>

        {/* Total Folders */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${workspace.color}20` }}
            >
              <FolderOpen className="w-5 h-5" style={{ color: workspace.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFolders}</p>
              <p className="text-xs text-gray-500">Folders</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${workspace.color}20` }}
            >
              <TrendingUp className="w-5 h-5" style={{ color: workspace.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.recentActivity}</p>
              <p className="text-xs text-gray-500">Notes This Week</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Last Modified Note Preview */}
      {stats.lastModified && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Recently Modified</h3>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">{stats.lastModified.title}</h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {stats.lastModified.content || 'Empty note'}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {new Date(stats.lastModified.updatedAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Summary Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-200 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-purple-900">AI Workspace Summary</h3>
        </div>
        <div className="space-y-3">
          {stats.totalNotes === 0 ? (
            <p className="text-sm text-purple-700">
              This workspace is empty. Start by creating your first note or adding folders to
              organize your work.
            </p>
          ) : (
            <>
              <p className="text-sm text-purple-900">
                You have <span className="font-semibold">{stats.totalNotes} notes</span>{' '}
                {stats.pinnedNotes > 0 && (
                  <>
                    (<span className="font-semibold">{stats.pinnedNotes} pinned</span>)
                  </>
                )}{' '}
                organized in <span className="font-semibold">{stats.totalFolders} folders</span>.
              </p>
              {stats.recentActivity > 0 && (
                <p className="text-sm text-purple-700">
                  You've been active this week with{' '}
                  <span className="font-semibold">{stats.recentActivity} notes</span> created or
                  updated. Keep up the momentum!
                </p>
              )}
              {stats.recentActivity === 0 && stats.totalNotes > 0 && (
                <p className="text-sm text-purple-700">
                  No recent activity this week. Consider revisiting your notes or starting a new
                  topic.
                </p>
              )}
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-purple-200">
          <p className="text-xs text-purple-600 mb-2 font-medium">Quick Tips:</p>
          <ul className="text-xs text-purple-700 space-y-1">
            <li>• Use [[note name]] to create links between notes</li>
            <li>• Press Ctrl+K to quickly search your notes</li>
            <li>• Pin important notes to keep them at the top</li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}
