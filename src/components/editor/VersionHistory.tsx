'use client';

import { useNotesStore } from '@/lib/store/useNotesStore';
import { NoteVersion } from '@/lib/store/types';
import { History, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface VersionHistoryProps {
  noteId: string;
}

export function VersionHistory({ noteId }: VersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { getNoteVersions, restoreVersion } = useNotesStore();
  const versions = getNoteVersions(noteId);

  const handleRestore = (versionId: string) => {
    if (confirm('Are you sure you want to restore this version? Current changes will be saved to history.')) {
      restoreVersion(noteId, versionId);
      setIsOpen(false);
    }
  };

  if (versions.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <History className="w-4 h-4" />
        <span>History ({versions.length})</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-semibold text-sm text-gray-900">Version History</h3>
              <p className="text-xs text-gray-500 mt-1">
                Last {versions.length} version{versions.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="p-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="p-3 rounded-lg hover:bg-gray-50 transition-colors mb-2"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                        {version.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(version.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestore(version.id)}
                      className="ml-2 p-1.5 text-[--color-primary-blue] hover:bg-blue-50 rounded transition-colors"
                      title="Restore this version"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2">
                    {version.content || 'No content'}
                  </p>

                  {version.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {version.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
