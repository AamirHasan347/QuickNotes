'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppSettings {
  // Appearance
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: 'public-sans' | 'inter' | 'system' | 'roboto' | 'poppins' | 'lora' | 'jetbrains-mono' | 'comic-neue' | 'minecraft';
  accentColor: 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'orange';
  uiDensity: 'compact' | 'medium' | 'spacious';

  // Editor
  autoSave: boolean;
  autoSaveDelay: number; // in seconds
  spellCheck: boolean;
  lineHeight: 'compact' | 'normal' | 'relaxed';
  smartFormatting: boolean;
  markdownShortcuts: boolean;
  autoLinkDetection: boolean;
  imageFloating: boolean;
  penSize: number; // 2, 4, 6, 10
  pressureSensitivity: boolean;
  strokeSmoothing: boolean;

  // AI Features
  aiEnabled: boolean;
  aiProvider: 'openai' | 'anthropic';
  aiModel: string;
  aiTemperature: number;
  aiTrigger: 'selection' | 'highlight' | 'shortcut';
  autoSummarize: boolean;

  // Mindmap AI Features
  mindmapAutoOrganizeOnAdd: boolean;
  mindmapShowSuggestedConnections: boolean;

  // Note Preferences
  guideLines: 'none' | 'dots' | 'single-line' | 'grid';
  sortBy: 'updated' | 'created' | 'title';
  sortOrder: 'asc' | 'desc';
  showPinned: boolean;

  // Workspace & Organization
  folderSortBy: 'name' | 'updated' | 'manual';
  showLinkedNotes: boolean;

  // Privacy & Data
  analyticsEnabled: boolean;
  cloudSyncEnabled: boolean;
  pinEnabled: boolean;
  encryptionEnabled: boolean;
  offlineMode: boolean;
  aiOptOut: string[]; // note IDs to exclude from AI

  // Shortcuts
  shortcuts: {
    newNote: string;
    search: string;
    focusMode: string;
    todayNote: string;
    aiAssistant: string;
  };
  customShortcuts: Record<string, string>; // custom user-defined shortcuts

  // Advanced
  reduceAnimations: boolean;
  gpuAcceleration: boolean;
  developerMode: boolean;
}

const defaultSettings: AppSettings = {
  // Appearance
  theme: 'light',
  fontSize: 'medium',
  fontFamily: 'public-sans',
  accentColor: 'blue',
  uiDensity: 'medium',

  // Editor
  autoSave: true,
  autoSaveDelay: 2, // 2 seconds
  spellCheck: true,
  lineHeight: 'normal',
  smartFormatting: true,
  markdownShortcuts: true,
  autoLinkDetection: true,
  imageFloating: true,
  penSize: 4,
  pressureSensitivity: false,
  strokeSmoothing: true,

  // AI Features
  aiEnabled: true,
  aiProvider: 'openai',
  aiModel: 'tngtech/deepseek-r1t2-chimera:free', // Free DeepSeek R1T2 Chimera model
  aiTemperature: 0.7,
  aiTrigger: 'selection',
  autoSummarize: false,

  // Mindmap AI Features
  mindmapAutoOrganizeOnAdd: false,
  mindmapShowSuggestedConnections: true,

  // Note Preferences
  guideLines: 'none',
  sortBy: 'updated',
  sortOrder: 'desc',
  showPinned: true,

  // Workspace & Organization
  folderSortBy: 'updated',
  showLinkedNotes: true,

  // Privacy & Data
  analyticsEnabled: false,
  cloudSyncEnabled: false,
  pinEnabled: false,
  encryptionEnabled: false,
  offlineMode: false,
  aiOptOut: [],

  // Shortcuts
  shortcuts: {
    newNote: 'Cmd+N',
    search: 'Cmd+K',
    focusMode: 'Cmd+\\',
    todayNote: 'Cmd+T',
    aiAssistant: 'Cmd+Shift+A',
  },
  customShortcuts: {},

  // Advanced
  reduceAnimations: false,
  gpuAcceleration: true,
  developerMode: false,
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
