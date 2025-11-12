import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Folder } from './types';

interface FolderState {
  folders: Folder[];
  activeFolderId: string | null;

  // Folder CRUD
  createFolder: (name: string, parentId?: string | null) => Folder;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  renameFolder: (id: string, name: string) => void;
  setFolderColor: (id: string, color: string) => void;
  togglePinFolder: (id: string) => void;

  // Navigation
  setActiveFolder: (id: string | null) => void;

  // Organization
  reorderFolders: (folderId: string, newOrder: number) => void;

  // Queries
  getFolderById: (id: string) => Folder | undefined;
  getFoldersByParent: (parentId: string | null) => Folder[];
  getRootFolders: () => Folder[];
  getSubfolders: (parentId: string) => Folder[];
}

export const useFolderStore = create<FolderState>()(
  persist(
    (set, get) => ({
      folders: [],
      activeFolderId: null,

      createFolder: (name: string, parentId: string | null = null) => {
        const newFolder: Folder = {
          id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          parentId,
          order: get().folders.filter(f => f.parentId === parentId).length,
          isPinned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          folders: [...state.folders, newFolder],
        }));

        return newFolder;
      },

      updateFolder: (id: string, updates: Partial<Folder>) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id
              ? { ...folder, ...updates, updatedAt: new Date() }
              : folder
          ),
        }));
      },

      deleteFolder: (id: string) => {
        // Delete folder and all its subfolders
        const foldersToDelete = [id];
        const subfolders = get().getSubfolders(id);
        foldersToDelete.push(...subfolders.map(f => f.id));

        set((state) => ({
          folders: state.folders.filter((folder) => !foldersToDelete.includes(folder.id)),
          activeFolderId: state.activeFolderId === id ? null : state.activeFolderId,
        }));
      },

      renameFolder: (id: string, name: string) => {
        get().updateFolder(id, { name });
      },

      setFolderColor: (id: string, color: string) => {
        get().updateFolder(id, { color });
      },

      togglePinFolder: (id: string) => {
        const folder = get().getFolderById(id);
        if (folder) {
          get().updateFolder(id, { isPinned: !folder.isPinned });
        }
      },

      setActiveFolder: (id: string | null) => {
        set({ activeFolderId: id });
      },

      reorderFolders: (folderId: string, newOrder: number) => {
        get().updateFolder(folderId, { order: newOrder });
      },

      getFolderById: (id: string) => {
        return get().folders.find((folder) => folder.id === id);
      },

      getFoldersByParent: (parentId: string | null) => {
        return get().folders
          .filter((folder) => folder.parentId === parentId)
          .sort((a, b) => {
            // Pinned folders first
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            // Then by order
            return a.order - b.order;
          });
      },

      getRootFolders: () => {
        return get().getFoldersByParent(null);
      },

      getSubfolders: (parentId: string) => {
        return get().getFoldersByParent(parentId);
      },
    }),
    {
      name: 'quicknotes-folders',
    }
  )
);
