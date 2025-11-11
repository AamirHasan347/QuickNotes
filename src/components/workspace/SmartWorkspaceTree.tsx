'use client';

import { useState } from 'react';
import { useSmartWorkspaceStore } from '@/lib/store/useSmartWorkspaceStore';
import { SmartWorkspaceNode } from './SmartWorkspaceNode';
import { Plus, ChevronDown, ChevronRight, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AddWorkspaceModal } from './AddWorkspaceModal';

export function SmartWorkspaceTree() {
  const {
    workspaces,
    folders,
    activeWorkspaceId,
    activeFolderId,
    setActiveWorkspace,
    setActiveFolder,
    getRootFoldersForWorkspace,
  } = useSmartWorkspaceStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(
    new Set(workspaces.map((w) => w.id))
  );

  const toggleWorkspace = (workspaceId: string) => {
    setExpandedWorkspaces((prev) => {
      const next = new Set(prev);
      if (next.has(workspaceId)) {
        next.delete(workspaceId);
      } else {
        next.add(workspaceId);
      }
      return next;
    });
  };

  const handleHomeClick = () => {
    setActiveWorkspace(null);
    setActiveFolder(null);
  };

  return (
    <div className="space-y-1">
      {/* Home Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleHomeClick}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
          activeWorkspaceId === null && activeFolderId === null
            ? 'bg-blue-100 text-blue-700 font-medium shadow-sm'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </motion.button>

      {/* Add Workspace Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Add Workspace</span>
      </button>

      {/* Workspaces */}
      <div className="space-y-1">
        {workspaces.map((workspace) => {
          const isExpanded = expandedWorkspaces.has(workspace.id);
          const rootFolders = getRootFoldersForWorkspace(workspace.id);

          return (
            <div key={workspace.id}>
              <SmartWorkspaceNode
                id={workspace.id}
                name={workspace.name}
                icon={workspace.icon}
                color={workspace.color}
                type="workspace"
                isActive={activeWorkspaceId === workspace.id && !activeFolderId}
                isExpanded={isExpanded}
                onToggle={() => toggleWorkspace(workspace.id)}
                onClick={() => {
                  setActiveWorkspace(workspace.id);
                  setActiveFolder(null);
                }}
                depth={0}
              />

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-4"
                  >
                    {rootFolders.map((folder) => (
                      <SmartWorkspaceNode
                        key={folder.id}
                        id={folder.id}
                        name={folder.name}
                        color={folder.color}
                        type="folder"
                        isActive={activeFolderId === folder.id}
                        isPinned={folder.isPinned}
                        workspaceId={workspace.id}
                        parentId={folder.parentId || null}
                        depth={folder.depth}
                        onClick={() => {
                          setActiveWorkspace(workspace.id);
                          setActiveFolder(folder.id);
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <AddWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
