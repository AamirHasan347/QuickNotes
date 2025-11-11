import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note, Workspace, NoteVersion } from './types';

interface NotesState {
  notes: Note[];
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  activeFolderId: string | null;
  searchQuery: string;
  noteVersions: NoteVersion[];

  // Note actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  reorderNotes: (notes: Note[]) => void;
  moveNoteToFolder: (noteId: string, folderId: string | null) => void;

  // Workspace actions
  addWorkspace: (workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  setActiveWorkspace: (id: string | null) => void;
  addFolderToWorkspace: (workspaceId: string, folderId: string) => void;
  removeFolderFromWorkspace: (workspaceId: string, folderId: string) => void;
  getWorkspaceFolders: (workspaceId: string) => string[];

  // Folder actions
  setActiveFolder: (id: string | null) => void;

  // Search
  setSearchQuery: (query: string) => void;

  // Daily Notes
  getTodayNote: () => Note | undefined;
  createTodayNote: () => Note;

  // Version History
  getNoteVersions: (noteId: string) => NoteVersion[];
  restoreVersion: (noteId: string, versionId: string) => void;

  // Getters
  getAllNotes: () => Note[]; // For global search
  getNotesInWorkspace: (workspaceId: string) => Note[]; // All notes in workspace (root + all folders)
  getNotesInFolder: (folderId: string) => Note[]; // Only notes in specific folder
  getFilteredNotes: () => Note[]; // Legacy - kept for compatibility
  getPinnedNotes: () => Note[];
  getNotesByFolder: (folderId: string | null) => Note[]; // Legacy
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      workspaces: [
        {
          id: 'physics',
          name: 'Physics',
          color: '#63cdff',
          folderIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'chemistry',
          name: 'Chemistry',
          color: '#8ef292',
          folderIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'mathematics',
          name: 'Mathematics',
          color: '#ff6b9d',
          folderIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      activeWorkspaceId: null,
      activeFolderId: null,
      searchQuery: '',
      noteVersions: [],

      addNote: (note) => {
        const newNote: Note = {
          ...note,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ notes: [newNote, ...state.notes] }));
        return newNote;
      },

      updateNote: (id, updates) => {
        set((state) => {
          const oldNote = state.notes.find((note) => note.id === id);
          if (!oldNote) return state;

          // Save current version to history before updating
          const newVersion: NoteVersion = {
            id: crypto.randomUUID(),
            noteId: id,
            title: oldNote.title,
            content: oldNote.content,
            tags: oldNote.tags,
            timestamp: new Date(),
          };

          // Keep only last 10 versions per note
          const existingVersions = state.noteVersions.filter(v => v.noteId === id);
          const newVersions = [newVersion, ...existingVersions].slice(0, 10);
          const otherVersions = state.noteVersions.filter(v => v.noteId !== id);

          return {
            notes: state.notes.map((note) =>
              note.id === id
                ? { ...note, ...updates, updatedAt: new Date() }
                : note
            ),
            noteVersions: [...newVersions, ...otherVersions],
          };
        });
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },

      togglePinNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, isPinned: !note.isPinned } : note
          ),
        }));
      },

      reorderNotes: (reorderedNotes) => {
        set({ notes: reorderedNotes });
      },

      addWorkspace: (workspace) => {
        const newWorkspace: Workspace = {
          ...workspace,
          id: workspace.name.toLowerCase().replace(/\s+/g, '-'),
          folderIds: workspace.folderIds || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          workspaces: [...state.workspaces, newWorkspace],
        }));
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
        set((state) => ({
          workspaces: state.workspaces.filter((workspace) => workspace.id !== id),
          // Reset active workspace if the deleted one was active
          activeWorkspaceId: state.activeWorkspaceId === id ? null : state.activeWorkspaceId,
        }));
      },

      setActiveWorkspace: (id) => {
        set({ activeWorkspaceId: id });
      },

      addFolderToWorkspace: (workspaceId, folderId) => {
        set((state) => ({
          workspaces: state.workspaces.map((workspace) =>
            workspace.id === workspaceId
              ? {
                  ...workspace,
                  folderIds: workspace.folderIds.includes(folderId)
                    ? workspace.folderIds
                    : [...workspace.folderIds, folderId],
                  updatedAt: new Date(),
                }
              : workspace
          ),
        }));
      },

      removeFolderFromWorkspace: (workspaceId, folderId) => {
        set((state) => ({
          workspaces: state.workspaces.map((workspace) =>
            workspace.id === workspaceId
              ? {
                  ...workspace,
                  folderIds: workspace.folderIds.filter((id) => id !== folderId),
                  updatedAt: new Date(),
                }
              : workspace
          ),
        }));
      },

      getWorkspaceFolders: (workspaceId) => {
        const workspace = get().workspaces.find((w) => w.id === workspaceId);
        return workspace?.folderIds || [];
      },

      moveNoteToFolder: (noteId, folderId) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? { ...note, folderId, updatedAt: new Date() }
              : note
          ),
        }));
      },

      setActiveFolder: (id) => {
        set({ activeFolderId: id });
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      getAllNotes: () => {
        const { notes, searchQuery } = get();
        let filtered = notes;

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (note) =>
              note.title.toLowerCase().includes(query) ||
              note.content.toLowerCase().includes(query) ||
              note.tags.some((tag) => tag.toLowerCase().includes(query))
          );
        }

        return filtered.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      },

      getNotesInWorkspace: (workspaceId) => {
        const { notes } = get();
        // Need to import useSmartWorkspaceStore to get folder IDs
        // Import will be added at the top of the file
        const smartWorkspaceStore = (window as any).__smartWorkspaceStore;

        if (!smartWorkspaceStore) {
          // Fallback: just get notes with matching workspaceId
          return notes.filter((note) => note.workspaceId === workspaceId);
        }

        // Get all folder IDs for this workspace
        const workspaceFolders = smartWorkspaceStore.getState().getWorkspaceFolders(workspaceId);
        const folderIds = workspaceFolders.map((f: any) => f.id);

        // Get notes that are either:
        // 1. At workspace root (workspaceId matches, no folderId)
        // 2. In any folder under this workspace (folderId in folderIds)
        const filtered = notes.filter(
          (note) =>
            (note.workspaceId === workspaceId && !note.folderId) ||
            (note.folderId && folderIds.includes(note.folderId))
        );

        return filtered.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      },

      getNotesInFolder: (folderId) => {
        const { notes } = get();
        const filtered = notes.filter((note) => note.folderId === folderId);

        return filtered.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      },

      getFilteredNotes: () => {
        const { notes, activeWorkspaceId, searchQuery } = get();
        let filtered = notes;

        if (activeWorkspaceId) {
          filtered = filtered.filter(
            (note) => note.workspaceId === activeWorkspaceId
          );
        }

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (note) =>
              note.title.toLowerCase().includes(query) ||
              note.content.toLowerCase().includes(query) ||
              note.tags.some((tag) => tag.toLowerCase().includes(query))
          );
        }

        return filtered;
      },

      getPinnedNotes: () => {
        return get().notes.filter((note) => note.isPinned);
      },

      getNotesByFolder: (folderId) => {
        const { notes, activeWorkspaceId } = get();
        let filtered = notes.filter((note) => note.folderId === folderId);

        // Also filter by workspace if one is active
        if (activeWorkspaceId) {
          filtered = filtered.filter((note) => note.workspaceId === activeWorkspaceId);
        }

        return filtered.sort((a, b) => {
          // Pinned notes first
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          // Then by updated date (newest first)
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      },

      getTodayNote: () => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const { notes } = get();
        return notes.find((note) => note.title === `Daily Note - ${today}`);
      },

      createTodayNote: () => {
        const today = new Date().toISOString().split('T')[0];
        const existingNote = get().getTodayNote();

        if (existingNote) {
          return existingNote;
        }

        const newNote: Note = {
          id: crypto.randomUUID(),
          title: `Daily Note - ${today}`,
          content: `# ${new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}\n\n## Today's Tasks\n\n## Notes\n\n`,
          tags: ['daily'],
          isPinned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({ notes: [newNote, ...state.notes] }));
        return newNote;
      },

      getNoteVersions: (noteId) => {
        return get().noteVersions.filter((v) => v.noteId === noteId);
      },

      restoreVersion: (noteId, versionId) => {
        const version = get().noteVersions.find((v) => v.id === versionId);
        if (!version) return;

        get().updateNote(noteId, {
          title: version.title,
          content: version.content,
          tags: version.tags,
        });
      },
    }),
    {
      name: 'quicknotes-storage',
    }
  )
);
