'use client';

import { useState, useRef, useEffect } from 'react';
import { useSmartWorkspaceStore } from '@/lib/store/useSmartWorkspaceStore';
import { useNotesStore } from '@/lib/store/useNotesStore';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderPlus,
  Edit2,
  Trash2,
  Pin,
  MoreVertical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SmartWorkspaceNodeProps {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  type: 'workspace' | 'folder';
  isActive: boolean;
  isExpanded?: boolean;
  isPinned?: boolean;
  workspaceId?: string;
  parentId?: string | null;
  depth: number;
  onToggle?: () => void;
  onClick: () => void;
}

export function SmartWorkspaceNode({
  id,
  name,
  icon,
  color,
  type,
  isActive,
  isExpanded,
  isPinned,
  workspaceId,
  parentId,
  depth,
  onToggle,
  onClick,
}: SmartWorkspaceNodeProps) {
  const {
    folders,
    getSubfolders,
    deleteWorkspace,
    deleteFolder,
    renameFolder,
    updateWorkspace,
    togglePinFolder,
    createFolder,
    canAddSubfolder,
    isTrashWorkspace,
    setActiveWorkspace,
    setActiveFolder,
  } = useSmartWorkspaceStore();

  const { getNotesByFolder } = useNotesStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const [showMenu, setShowMenu] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const subfolders = type === 'folder' ? getSubfolders(id) : [];
  const hasChildren = subfolders.length > 0;
  const isFolderExpanded = expandedFolders.has(id);

  // Get note count
  const noteCount = type === 'folder' ? getNotesByFolder(id).length : 0;

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when editing
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleToggleFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'workspace' && onToggle) {
      onToggle();
    } else {
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    }
  };

  const handleRename = () => {
    if (editValue.trim() && editValue !== name) {
      if (type === 'folder') {
        renameFolder(id, editValue.trim());
      } else {
        updateWorkspace(id, { name: editValue.trim() });
      }
    }
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleDelete = () => {
    const message = type === 'workspace'
      ? `Move workspace "${name}" to Trash? All folders and notes will be preserved in the Trash workspace.`
      : `Delete folder "${name}" and all its subfolders? This cannot be undone.`;

    if (confirm(message)) {
      if (type === 'workspace') {
        deleteWorkspace(id);
      } else {
        deleteFolder(id);
      }
    }
    setShowMenu(false);
  };

  const handleAddSubfolder = () => {
    if (type === 'folder' && workspaceId && canAddSubfolder(id)) {
      const newFolder = createFolder(`New Folder`, workspaceId, id);
      setExpandedFolders((prev) => new Set(prev).add(id));
    }
    setShowMenu(false);
  };

  const handleAddRootFolder = () => {
    if (type === 'workspace') {
      const newFolder = createFolder(`New Folder`, id, null);
      // Expand workspace if collapsed
      if (onToggle && !isExpanded) {
        onToggle();
      }
    }
    setShowMenu(false);
  };

  const handleTogglePin = () => {
    if (type === 'folder') {
      togglePinFolder(id);
    }
    setShowMenu(false);
  };

  return (
    <div>
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        className={cn(
          'group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer',
          isActive
            ? type === 'workspace'
              ? 'font-medium shadow-sm'
              : 'bg-gray-100 font-medium'
            : 'text-gray-700 hover:bg-gray-50'
        )}
        style={{
          backgroundColor: isActive && type === 'workspace' ? `${color}20` : undefined,
          color: isActive && type === 'workspace' ? color : undefined,
          paddingLeft: `${depth * 12 + 12}px`,
        }}
        onClick={onClick}
      >
        {/* Expand/Collapse Icon */}
        {(type === 'workspace' || hasChildren) && (
          <button
            onClick={handleToggleFolder}
            className="flex-shrink-0 p-0.5 hover:bg-gray-200 rounded"
          >
            {type === 'workspace' ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            ) : isFolderExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Icon */}
        {type === 'workspace' ? (
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
            style={{ backgroundColor: `${color}30` }}
          >
            {icon || '📁'}
          </div>
        ) : (
          <Folder
            className="w-4 h-4 flex-shrink-0"
            style={{ color: color || undefined }}
          />
        )}

        {/* Name (editable for folders) */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setEditValue(name);
                setIsEditing(false);
              }
            }}
            className="flex-1 bg-white border border-blue-400 rounded px-2 py-0.5 text-sm"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate">{name}</span>
        )}

        {/* Pin Icon */}
        {isPinned && <Pin className="w-3 h-3 text-blue-600" fill="currentColor" />}

        {/* Note Count */}
        {type === 'folder' && noteCount > 0 && (
          <span className="text-xs text-gray-400">{noteCount}</span>
        )}

        {/* Context Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-8 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-48"
              >
                {type === 'workspace' ? (
                  /* Workspace Menu */
                  <>
                    <button
                      onClick={handleAddRootFolder}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      <FolderPlus className="w-4 h-4" />
                      Add Folder
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      <Edit2 className="w-4 h-4" />
                      Rename
                    </button>
                    {!isTrashWorkspace(id) && (
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Move to Trash
                      </button>
                    )}
                  </>
                ) : (
                  /* Folder Menu */
                  <>
                    {canAddSubfolder(id) && depth < 3 && (
                      <button
                        onClick={handleAddSubfolder}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        <FolderPlus className="w-4 h-4" />
                        Add Subfolder
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      <Edit2 className="w-4 h-4" />
                      Rename
                    </button>
                    <button
                      onClick={handleTogglePin}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      <Pin className="w-4 h-4" />
                      {isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Subfolders */}
      {type === 'folder' && hasChildren && isFolderExpanded && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {subfolders.map((subfolder) => (
              <SmartWorkspaceNode
                key={subfolder.id}
                id={subfolder.id}
                name={subfolder.name}
                color={subfolder.color}
                type="folder"
                isActive={false}
                isPinned={subfolder.isPinned}
                workspaceId={subfolder.workspaceId}
                parentId={subfolder.parentId || null}
                depth={subfolder.depth ?? 1}
                onClick={() => {
                  // Set active workspace and folder when subfolder is clicked
                  if (subfolder.workspaceId) {
                    setActiveWorkspace(subfolder.workspaceId);
                  }
                  setActiveFolder(subfolder.id);
                }}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
