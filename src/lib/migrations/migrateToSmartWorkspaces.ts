/**
 * Migration Script: Legacy Workspaces + Folders → Smart Workspaces
 *
 * This script handles automatic migration from the old dual system
 * (separate workspaces and folders) to the new unified Smart Workspaces hierarchy.
 *
 * Migration Strategy:
 * 1. Convert old workspaces → SmartWorkspaces
 * 2. Assign folders to workspaces (based on folderIds array)
 * 3. Update folder structure with workspaceId and depth
 * 4. Migrate notes: remove workspaceId, ensure folderId is set
 * 5. Backup old data before proceeding
 */

import { SmartWorkspace, Folder, Workspace, Note } from '../store/types';

export interface MigrationResult {
  success: boolean;
  workspacesMigrated: number;
  foldersMigrated: number;
  notesMigrated: number;
  errors: string[];
  warnings?: string[];
  backup?: {
    workspaces: Workspace[];
    folders: Folder[];
    notes: Note[];
  };
}

export interface LegacyData {
  workspaces: Workspace[];
  folders: any[]; // Old folder format (missing workspaceId, depth)
  notes: Note[];
  activeFolderId?: string | null;
  activeWorkspaceId?: string | null;
}

/**
 * Main migration function
 */
export async function migrateToSmartWorkspaces(legacyData: LegacyData): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    workspacesMigrated: 0,
    foldersMigrated: 0,
    notesMigrated: 0,
    errors: [],
    warnings: [],
  };

  try {
    // Step 0: Create backup
    result.backup = {
      workspaces: JSON.parse(JSON.stringify(legacyData.workspaces)),
      folders: JSON.parse(JSON.stringify(legacyData.folders)),
      notes: JSON.parse(JSON.stringify(legacyData.notes)),
    };

    // Step 1: Convert workspaces to SmartWorkspaces
    const smartWorkspaces: SmartWorkspace[] = legacyData.workspaces.map(oldWorkspace => ({
      id: oldWorkspace.id,
      name: oldWorkspace.name,
      color: oldWorkspace.color,
      icon: oldWorkspace.icon,
      description: undefined,
      createdAt: oldWorkspace.createdAt,
      updatedAt: oldWorkspace.updatedAt,
    }));

    // Add a default "General" workspace if no workspaces exist
    if (smartWorkspaces.length === 0) {
      smartWorkspaces.push({
        id: 'workspace-general',
        name: 'General',
        color: '#63cdff',
        icon: '📁',
        description: 'General notes and documents',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    result.workspacesMigrated = smartWorkspaces.length;

    // Step 2: Build workspace-folder mapping from old folderIds arrays
    const folderToWorkspaceMap = new Map<string, string>();

    legacyData.workspaces.forEach(workspace => {
      if (workspace.folderIds && Array.isArray(workspace.folderIds)) {
        workspace.folderIds.forEach(folderId => {
          // If folder is in multiple workspaces, keep first assignment
          if (!folderToWorkspaceMap.has(folderId)) {
            folderToWorkspaceMap.set(folderId, workspace.id);
          }
        });
      }
    });

    // Step 3: Calculate folder depths and assign workspaces
    const calculateDepth = (folderId: string, folders: any[], memo: Map<string, number>): number => {
      if (memo.has(folderId)) {
        return memo.get(folderId)!;
      }

      const folder = folders.find(f => f.id === folderId);
      if (!folder || !folder.parentId) {
        memo.set(folderId, 1);
        return 1;
      }

      const depth = 1 + calculateDepth(folder.parentId, folders, memo);
      memo.set(folderId, depth);
      return depth;
    };

    const depthMemo = new Map<string, number>();
    legacyData.folders.forEach(folder => {
      calculateDepth(folder.id, legacyData.folders, depthMemo);
    });

    // Step 4: Convert folders to new format
    const newFolders: Folder[] = legacyData.folders.map(oldFolder => {
      let workspaceId = folderToWorkspaceMap.get(oldFolder.id);

      // If no workspace assigned, assign to first workspace or General
      if (!workspaceId) {
        workspaceId = smartWorkspaces[0].id;
      }

      const depth = depthMemo.get(oldFolder.id) || 1;

      return {
        id: oldFolder.id,
        name: oldFolder.name,
        workspaceId,
        parentId: oldFolder.parentId || null,
        color: oldFolder.color,
        isPinned: oldFolder.isPinned || false,
        order: oldFolder.order || 0,
        depth,
        createdAt: oldFolder.createdAt || new Date(),
        updatedAt: oldFolder.updatedAt || new Date(),
      };
    });

    result.foldersMigrated = newFolders.length;

    // Step 4.5: Auto-fix orphaned folders (folders with non-existent parents)
    const folderIdSet = new Set(newFolders.map(f => f.id));
    const orphanedFolders: string[] = [];

    newFolders.forEach(folder => {
      // If folder has a parentId that doesn't exist in our folders
      if (folder.parentId && !folderIdSet.has(folder.parentId)) {
        orphanedFolders.push(folder.name);
        // Fix: Make it a root-level folder
        folder.parentId = null;
        folder.depth = 1;
      }
    });

    // Add warnings for auto-fixed folders
    if (orphanedFolders.length > 0) {
      result.warnings?.push(
        `Auto-fixed ${orphanedFolders.length} folder(s) with missing parents: ${orphanedFolders.join(', ')}. These folders have been moved to root level.`
      );
      console.warn(`Auto-fixed ${orphanedFolders.length} orphaned folders:`, orphanedFolders);
    }

    // Step 5: Migrate notes
    const newNotes: Note[] = legacyData.notes.map(note => {
      const newNote = { ...note };

      // If note has workspaceId but no folderId, try to find a matching folder
      if (note.workspaceId && !note.folderId) {
        // Find a root folder in that workspace
        const workspaceRootFolder = newFolders.find(
          f => f.workspaceId === note.workspaceId && f.parentId === null
        );

        if (workspaceRootFolder) {
          newNote.folderId = workspaceRootFolder.id;
        }
      }

      // Remove deprecated workspaceId property
      delete newNote.workspaceId;

      return newNote;
    });

    result.notesMigrated = newNotes.length;

    // Step 6: Validate migration
    const validation = validateMigration(smartWorkspaces, newFolders, newNotes);
    if (!validation.valid) {
      result.errors.push(...validation.errors);
      result.success = false;
      return result;
    }

    // Step 7: Return migrated data
    result.success = true;

    return {
      ...result,
      migratedData: {
        workspaces: smartWorkspaces,
        folders: newFolders,
        notes: newNotes,
      },
    } as any;

  } catch (error) {
    result.success = false;
    result.errors.push(`Migration failed: ${error instanceof Error ? error.message : String(error)}`);
    return result;
  }
}

/**
 * Validate migrated data
 */
function validateMigration(
  workspaces: SmartWorkspace[],
  folders: Folder[],
  notes: Note[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check all folders have valid workspaceId
  folders.forEach(folder => {
    if (!workspaces.find(w => w.id === folder.workspaceId)) {
      errors.push(`Folder "${folder.name}" references non-existent workspace "${folder.workspaceId}"`);
    }

    // Check depth is valid (1-3)
    if (folder.depth < 1 || folder.depth > 3) {
      errors.push(`Folder "${folder.name}" has invalid depth ${folder.depth}`);
    }

    // Check parent exists if parentId is set
    if (folder.parentId && !folders.find(f => f.id === folder.parentId)) {
      errors.push(`Folder "${folder.name}" references non-existent parent "${folder.parentId}"`);
    }
  });

  // Check no notes have workspaceId anymore
  notes.forEach(note => {
    if ((note as any).workspaceId) {
      errors.push(`Note "${note.title}" still has workspaceId property`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  // Check localStorage for old data structure
  try {
    const oldStorage = localStorage.getItem('quicknotes-storage');
    const oldFolders = localStorage.getItem('quicknotes-folders');
    const newStorage = localStorage.getItem('quicknotes-smart-workspaces');

    // If new storage exists, migration already done
    if (newStorage) {
      return false;
    }

    // If old storage exists, migration needed
    if (oldStorage || oldFolders) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}

/**
 * Load legacy data from localStorage
 */
export function loadLegacyData(): LegacyData | null {
  try {
    const oldNotesStorage = localStorage.getItem('quicknotes-storage');
    const oldFoldersStorage = localStorage.getItem('quicknotes-folders');

    if (!oldNotesStorage && !oldFoldersStorage) {
      return null;
    }

    const notesData = oldNotesStorage ? JSON.parse(oldNotesStorage) : {};
    const foldersData = oldFoldersStorage ? JSON.parse(oldFoldersStorage) : {};

    // Parse dates
    const parseDate = (date: any) => (date ? new Date(date) : new Date());

    const workspaces: Workspace[] = (notesData.state?.workspaces || []).map((w: any) => ({
      ...w,
      createdAt: parseDate(w.createdAt),
      updatedAt: parseDate(w.updatedAt),
    }));

    const folders = (foldersData.state?.folders || []).map((f: any) => ({
      ...f,
      createdAt: parseDate(f.createdAt),
      updatedAt: parseDate(f.updatedAt),
    }));

    const notes: Note[] = (notesData.state?.notes || []).map((n: any) => ({
      ...n,
      createdAt: parseDate(n.createdAt),
      updatedAt: parseDate(n.updatedAt),
    }));

    return {
      workspaces,
      folders,
      notes,
      activeFolderId: foldersData.state?.activeFolderId,
      activeWorkspaceId: notesData.state?.activeWorkspaceId,
    };
  } catch (error) {
    console.error('Error loading legacy data:', error);
    return null;
  }
}

/**
 * Save migrated data to localStorage
 */
export function saveMigratedData(result: any): void {
  try {
    const { workspaces, folders, notes } = result.migratedData;

    // Save to new smart workspaces storage
    const newStorage = {
      state: {
        workspaces,
        folders,
        activeWorkspaceId: null,
        activeFolderId: null,
      },
      version: 0,
    };

    localStorage.setItem('quicknotes-smart-workspaces', JSON.stringify(newStorage));

    // Save notes to notes storage (without workspaceId)
    const notesStorage = {
      state: {
        notes,
        searchQuery: '',
      },
      version: 0,
    };

    localStorage.setItem('quicknotes-storage', JSON.stringify(notesStorage));

    // Mark migration as complete
    localStorage.setItem('quicknotes-migration-completed', 'true');

    // Archive old data (don't delete in case rollback needed)
    const backup = {
      timestamp: new Date().toISOString(),
      data: result.backup,
    };
    localStorage.setItem('quicknotes-migration-backup', JSON.stringify(backup));

  } catch (error) {
    console.error('Error saving migrated data:', error);
    throw error;
  }
}
