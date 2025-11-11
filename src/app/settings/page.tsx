'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Palette,
  Type,
  Save,
  Brain,
  Grid,
  Shield,
  Keyboard,
  X,
  Download,
  Upload,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useSettingsStore } from '@/lib/store/useSettingsStore';

type SettingsTab = 'appearance' | 'editor' | 'ai' | 'notes' | 'privacy' | 'shortcuts';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateSettings, resetSettings, exportSettings, importSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'editor', label: 'Editor', icon: Type },
    { id: 'ai', label: 'AI Features', icon: Brain },
    { id: 'notes', label: 'Notes', icon: Grid },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  ];

  const handleSave = () => {
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000);
  };

  const handleExport = () => {
    const json = exportSettings();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quicknotes-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const json = e.target?.result as string;
          importSettings(json);
          handleSave();
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Settings
              </button>
              <button
                onClick={handleImport}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import Settings
              </button>
              <button
                onClick={() => {
                  if (confirm('Reset all settings to defaults?')) {
                    resetSettings();
                    handleSave();
                  }
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8">
            {activeTab === 'appearance' && (
              <AppearanceSettings settings={settings} updateSettings={updateSettings} />
            )}
            {activeTab === 'editor' && (
              <EditorSettings settings={settings} updateSettings={updateSettings} />
            )}
            {activeTab === 'ai' && (
              <AISettings settings={settings} updateSettings={updateSettings} />
            )}
            {activeTab === 'notes' && (
              <NotesSettings settings={settings} updateSettings={updateSettings} />
            )}
            {activeTab === 'privacy' && (
              <PrivacySettings settings={settings} updateSettings={updateSettings} />
            )}
            {activeTab === 'shortcuts' && (
              <ShortcutsSettings settings={settings} updateSettings={updateSettings} />
            )}
          </div>
        </div>
      </div>

      {/* Saved Message */}
      {showSavedMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
        >
          <Check className="w-5 h-5" />
          Settings saved!
        </motion.div>
      )}
    </div>
  );
}

// Appearance Settings Component
function AppearanceSettings({ settings, updateSettings }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Appearance</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
          <div className="flex gap-3">
            {['light', 'dark', 'auto'].map((theme) => (
              <button
                key={theme}
                onClick={() => updateSettings({ theme })}
                className={`px-4 py-2 rounded-lg capitalize ${
                  settings.theme === theme
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
          <div className="flex gap-3">
            {['small', 'medium', 'large'].map((size) => (
              <button
                key={size}
                onClick={() => updateSettings({ fontSize: size })}
                className={`px-4 py-2 rounded-lg capitalize ${
                  settings.fontSize === size
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
          <select
            value={settings.fontFamily}
            onChange={(e) => updateSettings({ fontFamily: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="public-sans">Public Sans (Default)</option>
            <option value="inter">Inter</option>
            <option value="system">System Font</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Editor Settings Component
function EditorSettings({ settings, updateSettings }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Editor</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Auto-save</h3>
            <p className="text-sm text-gray-600">Automatically save changes as you type</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => updateSettings({ autoSave: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {settings.autoSave && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto-save Delay (ms)
            </label>
            <input
              type="number"
              value={settings.autoSaveDelay || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value)) {
                  updateSettings({ autoSaveDelay: value });
                }
              }}
              min="500"
              max="5000"
              step="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Spell Check</h3>
            <p className="text-sm text-gray-600">Enable spell checking in editor</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.spellCheck}
              onChange={(e) => updateSettings({ spellCheck: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Line Height</label>
          <div className="flex gap-3">
            {['compact', 'normal', 'relaxed'].map((height) => (
              <button
                key={height}
                onClick={() => updateSettings({ lineHeight: height })}
                className={`px-4 py-2 rounded-lg capitalize ${
                  settings.lineHeight === height
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {height}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// AI Settings Component
function AISettings({ settings, updateSettings }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">AI Features</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Enable AI Features</h3>
            <p className="text-sm text-gray-600">Turn AI-powered tools on or off</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.aiEnabled}
              onChange={(e) => updateSettings({ aiEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {settings.aiEnabled && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AI Provider</label>
              <select
                value={settings.aiProvider}
                onChange={(e) => updateSettings({ aiProvider: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic (Claude)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <input
                type="text"
                value={settings.aiModel}
                onChange={(e) => updateSettings({ aiModel: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., gpt-4, claude-3-opus"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature: {settings.aiTemperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.aiTemperature}
                onChange={(e) => updateSettings({ aiTemperature: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Focused</span>
                <span>Creative</span>
              </div>
            </div>

            {/* Mindmap AI Features */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mindmap AI Features</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Auto-Organize on Add</h4>
                    <p className="text-sm text-gray-600">
                      Automatically organize mindmap when adding new nodes (requires 3+ nodes)
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.mindmapAutoOrganizeOnAdd}
                      onChange={(e) => updateSettings({ mindmapAutoOrganizeOnAdd: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Show Suggested Connections</h4>
                    <p className="text-sm text-gray-600">
                      Display AI-suggested connections between related nodes
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.mindmapShowSuggestedConnections}
                      onChange={(e) => updateSettings({ mindmapShowSuggestedConnections: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Notes Settings Component
function NotesSettings({ settings, updateSettings }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Notes</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default View</label>
          <div className="flex gap-3">
            {['list', 'grid'].map((view) => (
              <button
                key={view}
                onClick={() => updateSettings({ defaultView: view })}
                className={`px-4 py-2 rounded-lg capitalize ${
                  settings.defaultView === view
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={settings.sortBy}
            onChange={(e) => updateSettings({ sortBy: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="updated">Last Updated</option>
            <option value="created">Created Date</option>
            <option value="title">Title</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
          <div className="flex gap-3">
            {[
              { value: 'desc', label: 'Newest First' },
              { value: 'asc', label: 'Oldest First' },
            ].map((order) => (
              <button
                key={order.value}
                onClick={() => updateSettings({ sortOrder: order.value })}
                className={`px-4 py-2 rounded-lg ${
                  settings.sortOrder === order.value
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {order.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Show Pinned Notes</h3>
            <p className="text-sm text-gray-600">Display pinned notes at the top</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showPinned}
              onChange={(e) => updateSettings({ showPinned: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

// Privacy Settings Component
function PrivacySettings({ settings, updateSettings }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Privacy & Data</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Analytics</h3>
            <p className="text-sm text-gray-600">Help improve QuickNotes by sharing usage data</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.analyticsEnabled}
              onChange={(e) => updateSettings({ analyticsEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Cloud Sync</h3>
            <p className="text-sm text-gray-600">Sync your notes across devices</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.cloudSyncEnabled}
              onChange={(e) => updateSettings({ cloudSyncEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

// Shortcuts Settings Component
function ShortcutsSettings({ settings, updateSettings }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">New Note</span>
            <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm">
              {settings.shortcuts.newNote}
            </kbd>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Search</span>
            <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm">
              {settings.shortcuts.search}
            </kbd>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Focus Mode</span>
            <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm">
              {settings.shortcuts.focusMode}
            </kbd>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Today's Note</span>
            <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm">
              {settings.shortcuts.todayNote}
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
