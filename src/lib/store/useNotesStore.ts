import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note, Workspace, NoteVersion } from './types';

interface NotesState {
  notes: Note[];
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  searchQuery: string;
  noteVersions: NoteVersion[];

  // Note actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  reorderNotes: (notes: Note[]) => void;

  // Workspace actions
  addWorkspace: (workspace: Omit<Workspace, 'id'>) => void;
  deleteWorkspace: (id: string) => void;
  setActiveWorkspace: (id: string | null) => void;

  // Search
  setSearchQuery: (query: string) => void;

  // Daily Notes
  getTodayNote: () => Note | undefined;
  createTodayNote: () => Note;

  // Version History
  getNoteVersions: (noteId: string) => NoteVersion[];
  restoreVersion: (noteId: string, versionId: string) => void;

  // Getters
  getFilteredNotes: () => Note[];
  getPinnedNotes: () => Note[];
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      workspaces: [
        { id: 'physics', name: 'Physics', color: '#63cdff' },
        { id: 'chemistry', name: 'Chemistry', color: '#8ef292' },
        { id: 'mathematics', name: 'Mathematics', color: '#ff6b9d' },
      ],
      activeWorkspaceId: null,
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
        };
        set((state) => ({
          workspaces: [...state.workspaces, newWorkspace],
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

      setSearchQuery: (query) => {
        set({ searchQuery: query });
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
