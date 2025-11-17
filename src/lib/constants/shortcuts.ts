/**
 * Keyboard Shortcuts Constants for QuickNotes
 *
 * This file defines all default keyboard shortcuts and their descriptions.
 * Shortcuts can be customized by users through the settings panel.
 */

export interface ShortcutDefinition {
  id: string;
  label: string;
  description: string;
  defaultKey: string;
  category: 'general' | 'editor' | 'ai' | 'navigation';
  action: string; // Action identifier for the shortcut handler
}

export const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
  // General Shortcuts
  {
    id: 'newNote',
    label: 'New Note',
    description: 'Create a new note',
    defaultKey: 'Cmd+N',
    category: 'general',
    action: 'NEW_NOTE',
  },
  {
    id: 'search',
    label: 'Search',
    description: 'Open global search',
    defaultKey: 'Cmd+K',
    category: 'general',
    action: 'OPEN_SEARCH',
  },
  {
    id: 'todayNote',
    label: "Today's Note",
    description: 'Open or create today\'s note',
    defaultKey: 'Cmd+T',
    category: 'general',
    action: 'OPEN_TODAY',
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Open settings panel',
    defaultKey: 'Cmd+,',
    category: 'general',
    action: 'OPEN_SETTINGS',
  },

  // Editor Shortcuts
  {
    id: 'focusMode',
    label: 'Focus Mode',
    description: 'Toggle distraction-free writing',
    defaultKey: 'Cmd+\\',
    category: 'editor',
    action: 'TOGGLE_FOCUS',
  },
  {
    id: 'bold',
    label: 'Bold',
    description: 'Make selected text bold',
    defaultKey: 'Cmd+B',
    category: 'editor',
    action: 'FORMAT_BOLD',
  },
  {
    id: 'italic',
    label: 'Italic',
    description: 'Make selected text italic',
    defaultKey: 'Cmd+I',
    category: 'editor',
    action: 'FORMAT_ITALIC',
  },
  {
    id: 'underline',
    label: 'Underline',
    description: 'Underline selected text',
    defaultKey: 'Cmd+U',
    category: 'editor',
    action: 'FORMAT_UNDERLINE',
  },
  {
    id: 'code',
    label: 'Code',
    description: 'Format as inline code',
    defaultKey: 'Cmd+E',
    category: 'editor',
    action: 'FORMAT_CODE',
  },
  {
    id: 'link',
    label: 'Insert Link',
    description: 'Insert or edit link',
    defaultKey: 'Cmd+K',
    category: 'editor',
    action: 'INSERT_LINK',
  },
  {
    id: 'save',
    label: 'Save',
    description: 'Save current note (when auto-save is off)',
    defaultKey: 'Cmd+S',
    category: 'editor',
    action: 'SAVE_NOTE',
  },
  {
    id: 'toggleBlocks',
    label: 'Toggle Block Mode',
    description: 'Switch to Notion-style blocks',
    defaultKey: 'Cmd+Shift+B',
    category: 'editor',
    action: 'TOGGLE_BLOCKS',
  },
  {
    id: 'toggleSketch',
    label: 'Toggle Sketch Mode',
    description: 'Switch to drawing canvas',
    defaultKey: 'Cmd+Shift+D',
    category: 'editor',
    action: 'TOGGLE_SKETCH',
  },

  // AI Shortcuts
  {
    id: 'aiAssistant',
    label: 'AI Assistant',
    description: 'Open AI assistant menu',
    defaultKey: 'Cmd+Shift+A',
    category: 'ai',
    action: 'OPEN_AI',
  },
  {
    id: 'summarize',
    label: 'Summarize',
    description: 'Summarize selected text',
    defaultKey: 'Cmd+Shift+S',
    category: 'ai',
    action: 'AI_SUMMARIZE',
  },
  {
    id: 'mindmap',
    label: 'Generate Mindmap',
    description: 'Create mindmap from selection',
    defaultKey: 'Cmd+Shift+M',
    category: 'ai',
    action: 'AI_MINDMAP',
  },
  {
    id: 'quiz',
    label: 'Generate Quiz',
    description: 'Create quiz from selection',
    defaultKey: 'Cmd+Shift+Q',
    category: 'ai',
    action: 'AI_QUIZ',
  },

  // Navigation Shortcuts
  {
    id: 'closeNote',
    label: 'Close Note',
    description: 'Close current note',
    defaultKey: 'Esc',
    category: 'navigation',
    action: 'CLOSE_NOTE',
  },
  {
    id: 'nextNote',
    label: 'Next Note',
    description: 'Navigate to next note',
    defaultKey: 'Cmd+]',
    category: 'navigation',
    action: 'NEXT_NOTE',
  },
  {
    id: 'prevNote',
    label: 'Previous Note',
    description: 'Navigate to previous note',
    defaultKey: 'Cmd+[',
    category: 'navigation',
    action: 'PREV_NOTE',
  },
];

/**
 * Platform-specific key mappings
 */
export const KEY_MAPPINGS = {
  // Modifiers
  Cmd: navigator.platform.includes('Mac') ? '⌘' : 'Ctrl',
  Alt: navigator.platform.includes('Mac') ? '⌥' : 'Alt',
  Shift: '⇧',
  Ctrl: 'Ctrl',

  // Special keys
  Enter: '↵',
  Backspace: '⌫',
  Delete: '⌦',
  Esc: '⎋',
  Tab: '⇥',
  Space: '␣',
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
} as const;

/**
 * Convert platform-agnostic shortcut string to platform-specific
 * Example: "Cmd+N" -> "⌘N" on Mac, "Ctrl+N" on Windows
 */
export function formatShortcut(shortcut: string): string {
  let formatted = shortcut;

  // Replace Cmd with platform-specific modifier
  if (navigator.platform.includes('Mac')) {
    formatted = formatted.replace(/Cmd/g, '⌘');
  } else {
    formatted = formatted.replace(/Cmd/g, 'Ctrl');
  }

  // Replace other modifiers
  formatted = formatted.replace(/Alt/g, KEY_MAPPINGS.Alt);
  formatted = formatted.replace(/Shift/g, KEY_MAPPINGS.Shift);

  // Replace special keys
  Object.entries(KEY_MAPPINGS).forEach(([key, symbol]) => {
    if (key !== 'Cmd' && key !== 'Alt' && key !== 'Shift' && key !== 'Ctrl') {
      formatted = formatted.replace(new RegExp(key, 'g'), symbol);
    }
  });

  return formatted;
}

/**
 * Parse keyboard event to shortcut string
 * Example: Cmd+Shift+A from KeyboardEvent
 */
export function parseKeyboardEvent(event: KeyboardEvent): string {
  const parts: string[] = [];

  // Add modifiers
  if (event.ctrlKey || event.metaKey) parts.push('Cmd');
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');

  // Add main key
  let key = event.key;

  // Normalize special keys
  if (key === 'Control' || key === 'Meta' || key === 'Alt' || key === 'Shift') {
    return ''; // Modifier-only, invalid shortcut
  }

  // Uppercase letters
  if (key.length === 1) {
    key = key.toUpperCase();
  }

  parts.push(key);

  return parts.join('+');
}

/**
 * Check if two shortcuts conflict
 */
export function shortcutsConflict(shortcut1: string, shortcut2: string): boolean {
  return shortcut1.toLowerCase() === shortcut2.toLowerCase();
}

/**
 * Validate shortcut string
 */
export function isValidShortcut(shortcut: string): boolean {
  if (!shortcut || shortcut.trim() === '') return false;

  const parts = shortcut.split('+');
  if (parts.length === 0) return false;

  // Must have at least one modifier or be a special key
  const modifiers = ['Cmd', 'Ctrl', 'Alt', 'Shift'];
  const hasModifier = parts.some((part) => modifiers.includes(part));
  const isSpecialKey = Object.keys(KEY_MAPPINGS).includes(parts[parts.length - 1]);

  return hasModifier || isSpecialKey;
}
