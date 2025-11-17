/**
 * Storage Utilities for QuickNotes
 *
 * Helper functions for managing localStorage, calculating storage usage,
 * and handling data persistence.
 */

/**
 * Calculate size of a value in bytes
 */
export function getSize(value: any): number {
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  return new Blob([str]).size;
}

/**
 * Get total localStorage usage in bytes
 */
export function getLocalStorageSize(): number {
  let total = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        total += getSize(key) + getSize(value);
      }
    }
  }

  return total;
}

/**
 * Get localStorage usage by key prefix
 */
export function getStorageSizeByPrefix(prefix: string): number {
  let total = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const value = localStorage.getItem(key);
      if (value) {
        total += getSize(key) + getSize(value);
      }
    }
  }

  return total;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Get storage breakdown by category
 */
export interface StorageBreakdown {
  total: number;
  notes: number;
  settings: number;
  workspaces: number;
  security: number;
  other: number;
  percentage: number; // Percentage of total localStorage quota used
}

export function getStorageBreakdown(): StorageBreakdown {
  const notesSize = getStorageSizeByPrefix('quicknotes-notes');
  const settingsSize = getStorageSizeByPrefix('quicknotes-settings');
  const workspacesSize = getStorageSizeByPrefix('quicknotes-workspaces');
  const securitySize = getStorageSizeByPrefix('quicknotes-security');
  const total = getLocalStorageSize();
  const other = total - (notesSize + settingsSize + workspacesSize + securitySize);

  // localStorage quota is typically 5-10MB, we'll estimate 5MB
  const quota = 5 * 1024 * 1024; // 5MB in bytes
  const percentage = (total / quota) * 100;

  return {
    total,
    notes: notesSize,
    settings: settingsSize,
    workspaces: workspacesSize,
    security: securitySize,
    other: Math.max(0, other),
    percentage: Math.min(100, percentage),
  };
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get all keys with a specific prefix
 */
export function getKeysByPrefix(prefix: string): string[] {
  const keys: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keys.push(key);
    }
  }

  return keys;
}

/**
 * Clear all data with a specific prefix
 */
export function clearByPrefix(prefix: string): number {
  const keys = getKeysByPrefix(prefix);

  keys.forEach((key) => {
    localStorage.removeItem(key);
  });

  return keys.length;
}

/**
 * Export all localStorage data
 */
export function exportAllData(): string {
  const data: Record<string, any> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    }
  }

  return JSON.stringify(data, null, 2);
}

/**
 * Import data into localStorage
 */
export function importAllData(jsonData: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonData);

    Object.entries(data).forEach(([key, value]) => {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Clear all QuickNotes data (DANGER ZONE)
 */
export function clearAllQuickNotesData(): number {
  const prefixes = [
    'quicknotes-notes',
    'quicknotes-settings',
    'quicknotes-workspaces',
    'quicknotes-security',
  ];

  let totalCleared = 0;

  prefixes.forEach((prefix) => {
    totalCleared += clearByPrefix(prefix);
  });

  return totalCleared;
}

/**
 * Get localStorage quota estimate (varies by browser)
 */
export async function estimateStorageQuota(): Promise<{
  quota: number;
  usage: number;
  available: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota || 0,
        usage: estimate.usage || 0,
        available: (estimate.quota || 0) - (estimate.usage || 0),
      };
    } catch (error) {
      console.error('Failed to estimate storage:', error);
    }
  }

  // Fallback to localStorage size
  const usage = getLocalStorageSize();
  const quota = 5 * 1024 * 1024; // 5MB fallback

  return {
    quota,
    usage,
    available: quota - usage,
  };
}

/**
 * Check if storage is nearly full (>80%)
 */
export function isStorageNearlyFull(): boolean {
  const breakdown = getStorageBreakdown();
  return breakdown.percentage > 80;
}

/**
 * Get human-readable storage status
 */
export function getStorageStatus(): {
  level: 'low' | 'medium' | 'high' | 'critical';
  message: string;
} {
  const breakdown = getStorageBreakdown();
  const percentage = breakdown.percentage;

  if (percentage < 50) {
    return {
      level: 'low',
      message: 'Storage usage is low',
    };
  } else if (percentage < 75) {
    return {
      level: 'medium',
      message: 'Storage usage is moderate',
    };
  } else if (percentage < 90) {
    return {
      level: 'high',
      message: 'Storage is getting full',
    };
  } else {
    return {
      level: 'critical',
      message: 'Storage is nearly full! Consider clearing old data.',
    };
  }
}
