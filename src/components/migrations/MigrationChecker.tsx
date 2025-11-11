'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import {
  needsMigration,
  loadLegacyData,
  migrateToSmartWorkspaces,
  saveMigratedData,
  type MigrationResult,
} from '@/lib/migrations/migrateToSmartWorkspaces';

export function MigrationChecker() {
  const [migrationStatus, setMigrationStatus] = useState<
    'checking' | 'migrating' | 'success' | 'error' | 'none'
  >('checking');
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAndMigrate();
  }, []);

  const checkAndMigrate = async () => {
    try {
      // Check if migration is needed
      const needsToMigrate = needsMigration();

      if (!needsToMigrate) {
        setMigrationStatus('none');
        return;
      }

      setMigrationStatus('migrating');

      // Load legacy data
      const legacyData = loadLegacyData();

      if (!legacyData) {
        setMigrationStatus('none');
        return;
      }

      // Run migration
      const result = await migrateToSmartWorkspaces(legacyData);
      setMigrationResult(result);

      if (result.success) {
        // Save migrated data
        saveMigratedData(result);
        setMigrationStatus('success');

        // Reload page after 2 seconds to apply changes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMigrationStatus('error');
        setError(result.errors.join(', '));
      }
    } catch (err) {
      setMigrationStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Migration error:', err);
    }
  };

  if (migrationStatus === 'none') {
    return null;
  }

  return (
    <AnimatePresence>
      {(migrationStatus === 'checking' || migrationStatus === 'migrating' || migrationStatus === 'success' || migrationStatus === 'error') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full"
          >
            {/* Checking */}
            {migrationStatus === 'checking' && (
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Checking for Updates
                </h2>
                <p className="text-sm text-gray-600">
                  Verifying your data structure...
                </p>
              </div>
            )}

            {/* Migrating */}
            {migrationStatus === 'migrating' && (
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Upgrading to Smart Workspaces
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  We're upgrading your data structure to the new Smart Workspaces system.
                  This will only take a moment...
                </p>
                {migrationResult && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>✓ Migrating {migrationResult.workspacesMigrated} workspaces</p>
                    <p>✓ Migrating {migrationResult.foldersMigrated} folders</p>
                    <p>✓ Updating {migrationResult.notesMigrated} notes</p>
                  </div>
                )}
              </div>
            )}

            {/* Success */}
            {migrationStatus === 'success' && (
              <div className="text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Migration Complete!
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Your data has been successfully upgraded to Smart Workspaces.
                </p>
                {migrationResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-left text-xs text-green-900 space-y-1">
                    <p>✓ {migrationResult.workspacesMigrated} workspaces migrated</p>
                    <p>✓ {migrationResult.foldersMigrated} folders organized</p>
                    <p>✓ {migrationResult.notesMigrated} notes updated</p>
                  </div>
                )}
                {migrationResult?.warnings && migrationResult.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left text-xs text-yellow-900 mt-3 space-y-1">
                    <p className="font-semibold mb-1">⚠️ Auto-fixes applied:</p>
                    {migrationResult.warnings.map((warning, idx) => (
                      <p key={idx}>• {warning}</p>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-4">
                  Reloading application...
                </p>
              </div>
            )}

            {/* Error */}
            {migrationStatus === 'error' && (
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Migration Failed
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  We encountered an error while upgrading your data:
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-left text-xs text-red-900 mb-4">
                  {error}
                </div>
                <p className="text-xs text-gray-500">
                  Your original data is safe. Please refresh the page and try again, or contact
                  support if the issue persists.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Reload Page
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
