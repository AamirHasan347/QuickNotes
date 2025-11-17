'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SecurityState {
  // PIN Lock
  pinHash: string | null; // Hashed PIN for verification
  isLocked: boolean; // Current lock state
  pinAttempts: number; // Failed attempts counter
  lastAttemptTime: number | null; // Timestamp of last failed attempt
  lockoutUntil: number | null; // Timestamp when lockout expires

  // Encryption
  encryptionKey: string | null; // Derived encryption key (stored securely)
  encryptedNotes: string[]; // Array of encrypted note IDs

  // Session
  lastActivityTime: number; // Last user activity timestamp
  autoLockTimeout: number; // Minutes of inactivity before auto-lock (0 = disabled)
}

const defaultState: SecurityState = {
  pinHash: null,
  isLocked: false,
  pinAttempts: 0,
  lastAttemptTime: null,
  lockoutUntil: null,
  encryptionKey: null,
  encryptedNotes: [],
  lastActivityTime: Date.now(),
  autoLockTimeout: 0, // Disabled by default
};

interface SecurityStore {
  state: SecurityState;

  // PIN Management
  setPINHash: (hash: string) => void;
  clearPIN: () => void;
  lock: () => void;
  unlock: () => void;
  recordFailedAttempt: () => void;
  resetAttempts: () => void;
  isLockedOut: () => boolean;

  // Encryption Management
  setEncryptionKey: (key: string) => void;
  clearEncryptionKey: () => void;
  addEncryptedNote: (noteId: string) => void;
  removeEncryptedNote: (noteId: string) => void;
  isNoteEncrypted: (noteId: string) => boolean;

  // Session Management
  updateActivity: () => void;
  setAutoLockTimeout: (minutes: number) => void;
  checkAutoLock: () => boolean;

  // Reset
  resetSecurity: () => void;
}

export const useSecurityStore = create<SecurityStore>()(
  persist(
    (set, get) => ({
      state: defaultState,

      // PIN Management
      setPINHash: (hash: string) => {
        set((state) => ({
          state: { ...state.state, pinHash: hash, isLocked: false },
        }));
      },

      clearPIN: () => {
        set((state) => ({
          state: {
            ...state.state,
            pinHash: null,
            isLocked: false,
            pinAttempts: 0,
            lastAttemptTime: null,
            lockoutUntil: null,
          },
        }));
      },

      lock: () => {
        set((state) => ({
          state: { ...state.state, isLocked: true },
        }));
      },

      unlock: () => {
        set((state) => ({
          state: {
            ...state.state,
            isLocked: false,
            pinAttempts: 0,
            lastAttemptTime: null,
          },
        }));
      },

      recordFailedAttempt: () => {
        const currentState = get().state;
        const newAttempts = currentState.pinAttempts + 1;
        const now = Date.now();

        // Lockout after 5 failed attempts for 5 minutes
        const lockoutUntil = newAttempts >= 5 ? now + (5 * 60 * 1000) : null;

        set((state) => ({
          state: {
            ...state.state,
            pinAttempts: newAttempts,
            lastAttemptTime: now,
            lockoutUntil,
          },
        }));
      },

      resetAttempts: () => {
        set((state) => ({
          state: {
            ...state.state,
            pinAttempts: 0,
            lastAttemptTime: null,
            lockoutUntil: null,
          },
        }));
      },

      isLockedOut: () => {
        const currentState = get().state;
        if (!currentState.lockoutUntil) return false;

        const now = Date.now();
        if (now < currentState.lockoutUntil) {
          return true;
        } else {
          // Lockout expired, reset
          get().resetAttempts();
          return false;
        }
      },

      // Encryption Management
      setEncryptionKey: (key: string) => {
        set((state) => ({
          state: { ...state.state, encryptionKey: key },
        }));
      },

      clearEncryptionKey: () => {
        set((state) => ({
          state: { ...state.state, encryptionKey: null, encryptedNotes: [] },
        }));
      },

      addEncryptedNote: (noteId: string) => {
        set((state) => {
          const encryptedNotes = state.state.encryptedNotes;
          if (!encryptedNotes.includes(noteId)) {
            return {
              state: {
                ...state.state,
                encryptedNotes: [...encryptedNotes, noteId],
              },
            };
          }
          return state;
        });
      },

      removeEncryptedNote: (noteId: string) => {
        set((state) => ({
          state: {
            ...state.state,
            encryptedNotes: state.state.encryptedNotes.filter((id) => id !== noteId),
          },
        }));
      },

      isNoteEncrypted: (noteId: string) => {
        return get().state.encryptedNotes.includes(noteId);
      },

      // Session Management
      updateActivity: () => {
        set((state) => ({
          state: { ...state.state, lastActivityTime: Date.now() },
        }));
      },

      setAutoLockTimeout: (minutes: number) => {
        set((state) => ({
          state: { ...state.state, autoLockTimeout: minutes },
        }));
      },

      checkAutoLock: () => {
        const currentState = get().state;

        // Only check if PIN is enabled and timeout is set
        if (!currentState.pinHash || currentState.autoLockTimeout === 0) {
          return false;
        }

        const now = Date.now();
        const inactiveTime = now - currentState.lastActivityTime;
        const timeoutMs = currentState.autoLockTimeout * 60 * 1000;

        if (inactiveTime >= timeoutMs && !currentState.isLocked) {
          get().lock();
          return true;
        }

        return false;
      },

      // Reset
      resetSecurity: () => {
        set({ state: defaultState });
      },
    }),
    {
      name: 'quicknotes-security',
    }
  )
);
