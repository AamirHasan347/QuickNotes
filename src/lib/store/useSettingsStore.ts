'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppSettings {
  // Appearance
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: 'public-sans' | 'inter' | 'system';

  // Editor
  autoSave: boolean;
  autoSaveDelay: number; // in milliseconds
  spellCheck: boolean;
  lineHeight: 'compact' | 'normal' | 'relaxed';

  // AI Features
  aiEnabled: boolean;
  aiProvider: 'openai' | 'anthropic';
  aiModel: string;
  aiTemperature: number;

  // Mindmap AI Features
  mindmapAutoOrganizeOnAdd: boolean;
  mindmapShowSuggestedConnections: boolean;

  // Note Preferences
  defaultView: 'list' | 'grid';
  sortBy: 'updated' | 'created' | 'title';
  sortOrder: 'asc' | 'desc';
  showPinned: boolean;

  // Privacy & Data
  analyticsEnabled: boolean;
  cloudSyncEnabled: boolean;

  // Shortcuts
  shortcuts: {
    newNote: string;
    search: string;
    focusMode: string;
    todayNote: string;
  };
}

const defaultSettings: AppSettings = {
  // Appearance
  theme: 'light',
  fontSize: 'medium',
  fontFamily: 'public-sans',

  // Editor
  autoSave: true,
  autoSaveDelay: 1000,
  spellCheck: true,
  lineHeight: 'normal',

  // AI Features
  aiEnabled: true,
  aiProvider: 'openai',
  aiModel: 'gpt-4',
  aiTemperature: 0.7,

  // Mindmap AI Features
  mindmapAutoOrganizeOnAdd: false,
  mindmapShowSuggestedConnections: true,

  // Note Preferences
  defaultView: 'list',
  sortBy: 'updated',
  sortOrder: 'desc',
  showPinned: true,

  // Privacy & Data
  analyticsEnabled: false,
  cloudSyncEnabled: false,

  // Shortcuts
  shortcuts: {
    newNote: 'Cmd+N',
    search: 'Cmd+K',
    focusMode: 'Cmd+\\',
    todayNote: 'Cmd+T',
  },
};

interface SettingsStore {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (json: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },

      exportSettings: () => {
        return JSON.stringify(get().settings, null, 2);
      },

      importSettings: (json) => {
        try {
          const imported = JSON.parse(json);
          set({ settings: { ...defaultSettings, ...imported } });
        } catch (error) {
          console.error('Failed to import settings:', error);
        }
      },
    }),
    {
      name: 'quicknotes-settings',
    }
  )
);
