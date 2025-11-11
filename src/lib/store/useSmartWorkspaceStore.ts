import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SmartWorkspace, Folder } from './types';

interface SmartWorkspaceState {
  workspaces: SmartWorkspace[];
  folders: Folder[];
  activeWorkspaceId: string | null;
  activeFolderId: string | null;

  // Workspace CRUD
  createWorkspace: (name: string, color: string, icon?: string, description?: string) => SmartWorkspace;
  updateWorkspace: (id: string, updates: Partial<SmartWorkspace>) => void;
  deleteWorkspace: (id: string) => void;
  ensureTrashWorkspace: () => SmartWorkspace;
  isTrashWorkspace: (workspaceId: string) => boolean;

  // Folder CRUD (with depth validation)
  createFolder: (name: string, workspaceId: string, parentId?: string | null, color?: string) => Folder;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  renameFolder: (id: string, name: string) => void;
  setFolderColor: (id: string, color: string) => void;
  togglePinFolder: (id: string) => void;
  moveFolder: (folderId: string, newParentId: string | null, newWorkspaceId?: string) => void;

  // Navigation
  setActiveWorkspace: (id: string | null) => void;
  setActiveFolder: (id: string | null) => void;

  // Organization
  reorderWorkspaces: (workspaceId: string, newOrder: number) => void;
  reorderFolders: (folderId: string, newOrder: number) => void;

  // Queries - Workspaces
  getWorkspaceById: (id: string) => SmartWorkspace | undefined;
  getWorkspaceFolders: (workspaceId: string) => Folder[];
  getRootFoldersForWorkspace: (workspaceId: string) => Folder[];

  // Queries - Folders
  getFolderById: (id: string) => Folder | undefined;
  getFoldersByParent: (parentId: string | null, workspaceId: string) => Folder[];
  getSubfolders: (parentId: string) => Folder[];
  getFolderDepth: (folderId: string) => number;
  getFolderPath: (folderId: string) => Folder[];
  canAddSubfolder: (parentId: string) => boolean; // Check if depth < 3
}

const MAX_FOLDER_DEPTH = 3;
export const TRASH_WORKSPACE_ID = 'workspace-trash-system';

export const useSmartWorkspaceStore = create<SmartWorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      folders: [],
      activeWorkspaceId: null,
      activeFolderId: null,

      // ==================== WORKSPACE OPERATIONS ====================

      createWorkspace: (name, color, icon, description) => {
        const newWorkspace: SmartWorkspace = {
          id: `workspace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          color,
          icon,
          description,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          workspaces: [...state.workspaces, newWorkspace],
        }));

        return newWorkspace;
      },

      updateWorkspace: (id, updates) => {
        set((state) => ({
          workspaces: state.workspaces.map((workspace) =>
            workspace.id === id
              ? { ...workspace, ...updates, updatedAt: new Date() }
              : workspace
          ),
        }));
      },

      deleteWorkspace: (id) => {
        // Can't delete the Trash workspace
        if (id === TRASH_WORKSPACE_ID) {
          console.warn('Cannot delete Trash workspace');
          return;
        }

        // Ensure Trash workspace exists
        const trashWorkspace = get().ensureTrashWorkspace();

        // Move all folders from this workspace to Trash
        set((state) => {
          const foldersToMove = state.folders.filter((f) => f.workspaceId === id);
          const updatedFolders = state.folders.map((folder) =>
            folder.workspaceId === id
              ? { ...folder, workspaceId: trashWorkspace.id, updatedAt: new Date() }
              : folder
          );

          return {
            workspaces: state.workspaces.filter((w) => w.id !== id),
            folders: updatedFolders,
            activeWorkspaceId: state.activeWorkspaceId === id ? null : state.activeWorkspaceId,
          };
        });

        // Also need to move notes - this will be handled by updating notes with workspaceId
        // Notes store will need to be updated separately or we can use a callback
      },

      ensureTrashWorkspace: () => {
        const { workspaces } = get();
        let trashWorkspace = workspaces.find((w) => w.id === TRASH_WORKSPACE_ID);

        if (!trashWorkspace) {
          trashWorkspace = {
            id: TRASH_WORKSPACE_ID,
            name: 'Trash',
            color: '#9ca3af', // Gray color
            icon: '🗑️',
            description: 'Deleted workspaces and folders',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set((state) => ({
            workspaces: [...state.workspaces, trashWorkspace!],
          }));
        }

        return trashWorkspace;
      },

      isTrashWorkspace: (workspaceId) => {
        return workspaceId === TRASH_WORKSPACE_ID;
      },

      // ==================== FOLDER OPERATIONS ====================

      createFolder: (name, workspaceId, parentId = null, color) => {
        // Calculate depth
        let depth = 1;
        if (parentId) {
          const parent = get().getFolderById(parentId);
          if (parent) {
            depth = parent.depth + 1;
          }
        }

        // Validate depth
        if (depth > MAX_FOLDER_DEPTH) {
          throw new Error(`Maximum folder depth of ${MAX_FOLDER_DEPTH} exceeded`);
        }

        const newFolder: Folder = {
          id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          workspaceId,
          parentId,
          color,
          order: get().folders.filter(f => f.parentId === parentId && f.workspaceId === workspaceId).length,
          depth,
          isPinned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          folders: [...state.folders, newFolder],
        }));

        return newFolder;
      },

      updateFolder: (id, updates) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id
              ? { ...folder, ...updates, updatedAt: new Date() }
              : folder
          ),
        }));
      },

      deleteFolder: (id) => {
        // Delete folder and all its subfolders recursively
        const foldersToDelete = [id];

        const addSubfolders = (parentId: string) => {
          const subfolders = get().getSubfolders(parentId);
          subfolders.forEach(subfolder => {
            foldersToDelete.push(subfolder.id);
            addSubfolders(subfolder.id);
          });
        };

        addSubfolders(id);

        set((state) => ({
          folders: state.folders.filter((folder) => !foldersToDelete.includes(folder.id)),
          activeFolderId: state.activeFolderId && foldersToDelete.includes(state.activeFolderId)
            ? null
            : state.activeFolderId,
        }));
      },

      renameFolder: (id, name) => {
        get().updateFolder(id, { name });
      },

      setFolderColor: (id, color) => {
        get().updateFolder(id, { color });
      },

      togglePinFolder: (id) => {
        const folder = get().getFolderById(id);
        if (folder) {
          get().updateFolder(id, { isPinned: !folder.isPinned });
        }
      },

      moveFolder: (folderId, newParentId, newWorkspaceId) => {
        const folder = get().getFolderById(folderId);
        if (!folder) return;

        // Calculate new depth
        let newDepth = 1;
        if (newParentId) {
          const newParent = get().getFolderById(newParentId);
          if (newParent) {
            newDepth = newParent.depth + 1;
          }
        }

        // Validate depth
        if (newDepth > MAX_FOLDER_DEPTH) {
          throw new Error(`Cannot move folder: would exceed maximum depth of ${MAX_FOLDER_DEPTH}`);
        }

        const updates: Partial<Folder> = {
          parentId: newParentId,
          depth: newDepth,
        };

        if (newWorkspaceId) {
          updates.workspaceId = newWorkspaceId;
        }

        get().updateFolder(folderId, updates);

        // Update depth of all subfolders recursively
        const updateSubfolderDepths = (parentId: string, parentDepth: number) => {
          const subfolders = get().getSubfolders(parentId);
          subfolders.forEach(subfolder => {
            const newSubDepth = parentDepth + 1;
            get().updateFolder(subfolder.id, {
              depth: newSubDepth,
              ...(newWorkspaceId && { workspaceId: newWorkspaceId })
            });
            updateSubfolderDepths(subfolder.id, newSubDepth);
          });
        };

        updateSubfolderDepths(folderId, newDepth);
      },

      // ==================== NAVIGATION ====================

      setActiveWorkspace: (id) => {
        set({
          activeWorkspaceId: id,
          activeFolderId: null, // Reset folder when changing workspace
        });
      },

      setActiveFolder: (id) => {
        set({ activeFolderId: id || null });
      },

      // ==================== ORGANIZATION ====================

      reorderWorkspaces: (workspaceId, newOrder) => {
        // This would need order field in SmartWorkspace, keeping simple for now
        // Can be added later if drag-and-drop workspace reordering is needed
      },

      reorderFolders: (folderId, newOrder) => {
        get().updateFolder(folderId, { order: newOrder });
      },

      // ==================== WORKSPACE QUERIES ====================

      getWorkspaceById: (id) => {
        return get().workspaces.find((workspace) => workspace.id === id);
      },

      getWorkspaceFolders: (workspaceId) => {
        return get().folders.filter((folder) => folder.workspaceId === workspaceId);
      },

      getRootFoldersForWorkspace: (workspaceId) => {
        return get().folders
          .filter((folder) => folder.workspaceId === workspaceId && folder.parentId === null)
          .sort((a, b) => {
            // Pinned folders first
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            // Then by order
            return a.order - b.order;
          });
      },

      // ==================== FOLDER QUERIES ====================

      getFolderById: (id) => {
        return get().folders.find((folder) => folder.id === id);
      },

      getFoldersByParent: (parentId, workspaceId) => {
        return get().folders
          .filter((folder) => folder.parentId === parentId && folder.workspaceId === workspaceId)
          .sort((a, b) => {
            // Pinned folders first
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            // Then by order
            return a.order - b.order;
          });
      },

      getSubfolders: (parentId) => {
        return get().folders.filter((folder) => folder.parentId === parentId);
      },

      getFolderDepth: (folderId) => {
        const folder = get().getFolderById(folderId);
        return folder?.depth || 0;
      },

      getFolderPath: (folderId) => {
        const path: Folder[] = [];
        let currentId: string | null = folderId;

        while (currentId) {
          const folder = get().getFolderById(currentId);
          if (!folder) break;
          path.unshift(folder);
          currentId = folder.parentId || null;
        }

        return path;
      },

      canAddSubfolder: (parentId) => {
        const parent = get().getFolderById(parentId);
        return parent ? parent.depth < MAX_FOLDER_DEPTH : false;
      },
    }),
    {
      name: 'quicknotes-smart-workspaces',
    }
  )
);

// Expose store globally for cross-store access (used by useNotesStore)
if (typeof window !== 'undefined') {
  (window as any).__smartWorkspaceStore = useSmartWorkspaceStore;
}
