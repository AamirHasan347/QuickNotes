'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder as FolderIcon,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Pin,
  PinOff,
} from 'lucide-react';
import { useFolderStore } from '@/lib/store/useFolderStore';
import { useNotesStore } from '@/lib/store/useNotesStore';
import { Folder } from '@/lib/store/types';

interface FolderListProps {
  onNoteClick?: (noteId: string) => void;
}

export function FolderList({ onNoteClick }: FolderListProps) {
  const {
    folders,
    activeFolderId,
    setActiveFolder,
    createFolder,
    deleteFolder,
    renameFolder,
    togglePinFolder,
    getRootFolders,
    getSubfolders,
  } = useFolderStore();

  const { getNotesByFolder, activeFolderId: activeNoteFolderId, setActiveFolder: setActiveNoteFolder, activeWorkspaceId, getWorkspaceFolders } = useNotesStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showMenuId, setShowMenuId] = useState<string | null>(null);
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const toggleExpand = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleSelectFolder = (folderId: string | null) => {
    setActiveFolder(folderId);
    setActiveNoteFolder(folderId);
  };

  const handleCreateFolder = (parentId: string | null = null) => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim(), parentId);
      setNewFolderName('');
      setIsCreatingFolder(false);
      setNewFolderParentId(null);
    }
  };

  const handleRenameFolder = (folderId: string) => {
    if (editingName.trim()) {
      renameFolder(folderId, editingName.trim());
      setEditingFolderId(null);
      setEditingName('');
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    if (confirm('Delete this folder? Notes inside will not be deleted.')) {
      deleteFolder(folderId);
      setShowMenuId(null);
    }
  };

  const startEditing = (folder: Folder) => {
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
    setShowMenuId(null);
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const subfolders = getSubfolders(folder.id);
    const hasSubfolders = subfolders.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isActive = activeFolderId === folder.id || activeNoteFolderId === folder.id;
    const noteCount = getNotesByFolder(folder.id).length;

    return (
      <div key={folder.id}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
            isActive
              ? 'bg-blue-50 text-blue-700'
              : 'hover:bg-gray-50 text-gray-700'
          }`}
          style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        >
          {/* Expand/Collapse Button */}
          {hasSubfolders && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(folder.id);
              }}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Folder Icon */}
          <div
            onClick={() => handleSelectFolder(folder.id)}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 flex-shrink-0" style={{ color: folder.color }} />
            ) : (
              <FolderIcon className="w-4 h-4 flex-shrink-0" style={{ color: folder.color }} />
            )}

            {/* Folder Name / Edit Input */}
            {editingFolderId === folder.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleRenameFolder(folder.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameFolder(folder.id);
                  if (e.key === 'Escape') {
                    setEditingFolderId(null);
                    setEditingName('');
                  }
                }}
                className="flex-1 px-2 py-0.5 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm font-medium truncate">{folder.name}</span>
                {folder.isPinned && <Pin className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                {noteCount > 0 && (
                  <span className="text-xs text-gray-500 flex-shrink-0">({noteCount})</span>
                )}
              </div>
            )}
          </div>

          {/* Menu Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenuId(showMenuId === folder.id ? null : folder.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all flex-shrink-0"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Context Menu */}
          <AnimatePresence>
            {showMenuId === folder.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setNewFolderParentId(folder.id);
                    setIsCreatingFolder(true);
                    setShowMenuId(null);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Subfolder
                </button>
                <button
                  onClick={() => startEditing(folder)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Rename
                </button>
                <button
                  onClick={() => {
                    togglePinFolder(folder.id);
                    setShowMenuId(null);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  {folder.isPinned ? (
                    <>
                      <PinOff className="w-4 h-4" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="w-4 h-4" />
                      Pin
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteFolder(folder.id)}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Subfolders */}
        <AnimatePresence>
          {isExpanded && hasSubfolders && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {subfolders.map((subfolder) => renderFolder(subfolder, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Subfolder Input */}
        {isCreatingFolder && newFolderParentId === folder.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="ml-8 mt-1"
          >
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={() => {
                if (!newFolderName.trim()) {
                  setIsCreatingFolder(false);
                  setNewFolderParentId(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder(folder.id);
                if (e.key === 'Escape') {
                  setIsCreatingFolder(false);
                  setNewFolderParentId(null);
                  setNewFolderName('');
                }
              }}
              placeholder="Subfolder name..."
              className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </motion.div>
        )}
      </div>
    );
  };

  // Filter root folders based on active workspace
  const rootFolders = getRootFolders().filter((folder) => {
    // If no workspace is active, show all folders
    if (!activeWorkspaceId) return true;

    // If workspace is active, only show folders that belong to this workspace
    const workspaceFolderIds = getWorkspaceFolders(activeWorkspaceId);
    return workspaceFolderIds.includes(folder.id);
  });

  return (
    <div className="space-y-1">
      {/* All Notes (No Folder) */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => handleSelectFolder(null)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
          activeFolderId === null && activeNoteFolderId === null
            ? 'bg-blue-50 text-blue-700'
            : 'hover:bg-gray-50 text-gray-700'
        }`}
      >
        <FolderIcon className="w-4 h-4" />
        <span className="text-sm font-medium">All Notes</span>
        <span className="text-xs text-gray-500">({getNotesByFolder(null).length})</span>
      </motion.div>

      {/* Root Folders */}
      {rootFolders.map((folder) => renderFolder(folder))}

      {/* New Root Folder Input */}
      {isCreatingFolder && newFolderParentId === null && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-1"
        >
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onBlur={() => {
              if (!newFolderName.trim()) {
                setIsCreatingFolder(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder(null);
              if (e.key === 'Escape') {
                setIsCreatingFolder(false);
                setNewFolderName('');
              }
            }}
            placeholder="Folder name..."
            className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </motion.div>
      )}

      {/* Add Folder Button */}
      {!isCreatingFolder && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setIsCreatingFolder(true);
            setNewFolderParentId(null);
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          New Folder
        </motion.button>
      )}
    </div>
  );
}
