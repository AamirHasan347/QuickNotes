'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Palette,
  Type,
  Save,
  Grid,
  Shield,
  Keyboard,
  X,
  Download,
  Upload,
  RotateCcw,
  Check,
  FileText,
  Circle,
  Minus,
  Grid3x3,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { AccentColorPicker } from '@/components/settings/AccentColorPicker';

type SettingsTab = 'appearance' | 'editor' | 'notes' | 'ai' | 'privacy' | 'shortcuts' | 'advanced';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateSettings, resetSettings, exportSettings, importSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'editor', label: 'Editor', icon: Type },
    { id: 'notes', label: 'Notes', icon: Grid },
    { id: 'ai', label: 'AI Features', icon: Sparkles },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
    { id: 'advanced', label: 'Advanced', icon: Sliders },
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
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-[#63cdff]" />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
          </div>
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--bg-hover)' }}
          >
            <X className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto rounded-2xl shadow-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="flex">
          {/* Sidebar Tabs */}
          <div className="w-64 p-4" style={{ backgroundColor: 'var(--bg-tertiary)', borderRight: '1px solid var(--border-primary)' }}>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                    style={{
                      backgroundColor: activeTab === tab.id ? '#e4f6e5' : 'transparent',
                      color: activeTab === tab.id ? '#121421' : 'var(--text-secondary)',
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 space-y-2" style={{ borderTop: '1px solid var(--border-primary)' }}>
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors"
                style={{
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Download className="w-4 h-4" />
                Export Settings
              </button>
              <button
                onClick={handleImport}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors"
                style={{
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
            {activeTab === 'notes' && (
              <NotesSettings settings={settings} updateSettings={updateSettings} />
            )}
            {activeTab === 'ai' && (
              <AISettings settings={settings} updateSettings={updateSettings} />
            )}
            {activeTab === 'privacy' && (
              <PrivacySettings settings={settings} updateSettings={updateSettings} />
            )}
            {activeTab === 'shortcuts' && (
              <ShortcutsSettings settings={settings} updateSettings={updateSettings} />
            )}
            {activeTab === 'advanced' && (
              <AdvancedSettings settings={settings} updateSettings={updateSettings} />
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
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Appearance</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Theme</label>
          <div className="flex gap-3">
            {['light', 'dark', 'auto'].map((theme) => (
              <button
                key={theme}
                onClick={() => updateSettings({ theme })}
                className="px-4 py-2 rounded-lg capitalize border-2 transition-all"
                style={{
                  backgroundColor: settings.theme === theme ? '#e4f6e5' : 'var(--bg-tertiary)',
                  color: settings.theme === theme ? '#121421' : 'var(--text-secondary)',
                  borderColor: settings.theme === theme ? '#8ef292' : 'transparent',
                }}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Font Size</label>
          <div className="flex gap-3">
            {['small', 'medium', 'large'].map((size) => (
              <button
                key={size}
                onClick={() => updateSettings({ fontSize: size })}
                className="px-4 py-2 rounded-lg capitalize border-2 transition-all"
                style={{
                  backgroundColor: settings.fontSize === size ? '#e4f6e5' : 'var(--bg-tertiary)',
                  color: settings.fontSize === size ? '#121421' : 'var(--text-secondary)',
                  borderColor: settings.fontSize === size ? '#8ef292' : 'transparent',
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Font Family</label>
          <select
            value={settings.fontFamily}
            onChange={(e) => updateSettings({ fontFamily: e.target.value })}
            className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <option value="public-sans">Public Sans (Default)</option>
            <option value="inter">Inter</option>
            <option value="roboto">Roboto</option>
            <option value="poppins">Poppins</option>
            <option value="lora">Lora (Serif)</option>
            <option value="jetbrains-mono">JetBrains Mono (Code)</option>
            <option value="comic-neue">Comic Neue</option>
            <option value="minecraft">Minecraft</option>
            <option value="system">System Font</option>
          </select>
        </div>

        <AccentColorPicker
          selected={settings.accentColor}
          onChange={(color) => updateSettings({ accentColor: color })}
        />

        {/* UI Density - Temporarily disabled to prevent layout issues */}
        {/* Will be re-enabled when components are properly tagged with density classes */}
        {/*
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>UI Density</label>
          <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Adjust spacing and padding throughout the interface (Coming Soon)
          </p>
          <div className="flex gap-3">
            {['compact', 'medium', 'spacious'].map((density) => (
              <button
                key={density}
                onClick={() => updateSettings({ uiDensity: density })}
                className="px-4 py-2 rounded-lg capitalize border-2 transition-all opacity-50 cursor-not-allowed"
                disabled
                style={{
                  backgroundColor: settings.uiDensity === density ? '#e4f6e5' : 'var(--bg-tertiary)',
                  color: settings.uiDensity === density ? '#121421' : 'var(--text-secondary)',
                  borderColor: settings.uiDensity === density ? '#8ef292' : 'transparent',
                }}
              >
                {density}
              </button>
            ))}
          </div>
        </div>
        */}
      </div>
    </div>
  );
}

// Editor Settings Component
function EditorSettings({ settings, updateSettings }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Editor</h2>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        Customize your writing experience with auto-save, spell check, and line spacing preferences.
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Auto-save</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {settings.autoSave
                ? 'Notes are automatically saved as you type'
                : 'Manual save button will appear in note editor'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => updateSettings({ autoSave: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#63cdff]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#63cdff]"></div>
          </label>
        </div>

        {settings.autoSave && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Auto-save Delay (seconds)
            </label>
            <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
              Time to wait after you stop typing before auto-saving (1-10 seconds)
            </p>
            <input
              type="number"
              value={settings.autoSaveDelay || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 1 && value <= 10) {
                  updateSettings({ autoSaveDelay: value });
                }
              }}
              min="1"
              max="10"
              step="1"
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#63cdff]"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
              }}
              placeholder="2"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Spell Check</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Enable spell checking in editor</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.spellCheck}
              onChange={(e) => updateSettings({ spellCheck: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#63cdff]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#63cdff]"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Line Height</label>
          <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Adjust spacing between lines in your notes
          </p>
          <div className="space-y-3">
            {[
              { value: 'compact', label: 'Compact', description: '1.4x spacing - Dense text layout for maximum content' },
              { value: 'normal', label: 'Normal', description: '1.6x spacing - Balanced readability and space efficiency' },
              { value: 'relaxed', label: 'Relaxed', description: '1.8x spacing - Comfortable reading with generous spacing' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => updateSettings({ lineHeight: option.value })}
                className="w-full text-left px-4 py-3 rounded-lg border-2 transition-all"
                style={{
                  backgroundColor: settings.lineHeight === option.value ? '#e4f6e5' : 'var(--bg-tertiary)',
                  color: settings.lineHeight === option.value ? '#121421' : 'var(--text-secondary)',
                  borderColor: settings.lineHeight === option.value ? '#8ef292' : 'transparent',
                }}
              >
                <div className="font-medium" style={{ color: settings.lineHeight === option.value ? '#121421' : 'var(--text-primary)' }}>
                  {option.label}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Smart Formatting</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Auto-convert typing patterns like "- ", "1. ", "* " into formatted lists
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.smartFormatting}
              onChange={(e) => updateSettings({ smartFormatting: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#63cdff]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#63cdff]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Markdown Shortcuts</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Enable shortcuts like **bold**, *italic*, ## heading, &gt; quote
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.markdownShortcuts}
              onChange={(e) => updateSettings({ markdownShortcuts: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#63cdff]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#63cdff]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Auto-Link Detection</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Automatically convert pasted URLs into clickable links
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoLinkDetection}
              onChange={(e) => updateSettings({ autoLinkDetection: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#63cdff]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#63cdff]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Floating Images</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Allow text to wrap around images automatically
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.imageFloating}
              onChange={(e) => updateSettings({ imageFloating: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#63cdff]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#63cdff]"></div>
          </label>
        </div>

        <div className="pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Sketch Mode Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Pen Size
              </label>
              <div className="flex gap-3">
                {[2, 4, 6, 10].map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSettings({ penSize: size })}
                    className="px-4 py-2 rounded-lg border-2 transition-all"
                    style={{
                      backgroundColor: settings.penSize === size ? '#e4f6e5' : 'var(--bg-tertiary)',
                      color: settings.penSize === size ? '#121421' : 'var(--text-secondary)',
                      borderColor: settings.penSize === size ? '#8ef292' : 'transparent',
                    }}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Pressure Sensitivity</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Vary stroke width based on pen pressure (requires stylus)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pressureSensitivity}
                  onChange={(e) => updateSettings({ pressureSensitivity: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#63cdff]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#63cdff]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Stroke Smoothing</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Smooth out hand-drawn strokes for cleaner sketches
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.strokeSmoothing}
                  onChange={(e) => updateSettings({ strokeSmoothing: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#63cdff]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#63cdff]"></div>
              </label>
            </div>
          </div>
        </div>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Guide Lines</label>
          <p className="text-xs text-gray-500 mb-3">Choose guide lines for text and sketch modes</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'none', label: 'None', icon: FileText, description: 'Plain background' },
              { value: 'dots', label: 'Dots', icon: Circle, description: 'Dotted pattern' },
              { value: 'single-line', label: 'Single Line', icon: Minus, description: 'Horizontal lines' },
              { value: 'grid', label: 'Grid', icon: Grid3x3, description: 'Grid pattern' },
            ].map((guideLine) => {
              const Icon = guideLine.icon;
              return (
                <button
                  key={guideLine.value}
                  onClick={() => updateSettings({ guideLines: guideLine.value })}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    settings.guideLines === guideLine.value
                      ? 'bg-purple-100 text-purple-700 border-purple-300'
                      : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
                  }`}
                  title={guideLine.description}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{guideLine.label}</span>
                  </div>
                </button>
              );
            })}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Folder Sorting</label>
          <p className="text-xs text-gray-500 mb-3">Choose how folders are organized in the sidebar</p>
          <select
            value={settings.folderSortBy}
            onChange={(e) => updateSettings({ folderSortBy: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="name">Alphabetically (A → Z)</option>
            <option value="updated">Last Updated</option>
            <option value="manual">Manual Order</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Linked Notes</h3>
            <p className="text-sm text-gray-600">Enable [[note name]] syntax for linking between notes</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showLinkedNotes}
              onChange={(e) => updateSettings({ showLinkedNotes: e.target.checked })}
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
  const [showPinSetup, setShowPinSetup] = useState(false);

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

        <div className="pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Security</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">PIN Lock</h3>
                <p className="text-sm text-gray-600">
                  {settings.pinEnabled ? 'App is protected with a PIN' : 'Require PIN to access the app'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pinEnabled}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setShowPinSetup(true);
                    } else {
                      if (confirm('Disable PIN protection? Your app will no longer require a PIN to access.')) {
                        updateSettings({ pinEnabled: false });
                      }
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {showPinSetup && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">Set up PIN</h4>
                <p className="text-sm text-purple-700 mb-3">
                  Enter a 4-digit PIN to protect your notes
                </p>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="Enter 4-digit PIN"
                  className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.length === 4) {
                      updateSettings({ pinEnabled: true });
                      setShowPinSetup(false);
                      alert('PIN protection enabled!');
                    }
                  }}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      updateSettings({ pinEnabled: true });
                      setShowPinSetup(false);
                      alert('PIN protection enabled!');
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                  >
                    Enable PIN
                  </button>
                  <button
                    onClick={() => setShowPinSetup(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Note Encryption</h3>
                <p className="text-sm text-gray-600">
                  Encrypt note content stored locally (requires PIN)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.encryptionEnabled}
                  onChange={(e) => {
                    if (e.target.checked && !settings.pinEnabled) {
                      alert('Please enable PIN lock first to use encryption');
                      return;
                    }
                    updateSettings({ encryptionEnabled: e.target.checked });
                  }}
                  className="sr-only peer"
                  disabled={!settings.pinEnabled}
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 ${!settings.pinEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Offline Mode</h3>
                <p className="text-sm text-gray-600">
                  Disable all network requests and AI features for complete privacy
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.offlineMode}
                  onChange={(e) => updateSettings({ offlineMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
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
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>AI Features</h2>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        Configure AI-powered features like summarization, mindmap generation, and intelligent suggestions.
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Enable AI Features</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Turn on AI-powered tools like summarization, mindmaps, and quiz generation
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.aiEnabled}
              onChange={(e) => updateSettings({ aiEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#63cdff]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#63cdff]"></div>
          </label>
        </div>

        {settings.aiEnabled && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                AI Provider
              </label>
              <select
                value={settings.aiProvider}
                onChange={(e) => updateSettings({ aiProvider: e.target.value })}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic (Claude)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                AI Model
              </label>
              <input
                type="text"
                value={settings.aiModel}
                onChange={(e) => updateSettings({ aiModel: e.target.value })}
                placeholder={settings.aiProvider === 'openai' ? 'gpt-4' : 'claude-3-sonnet'}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Temperature ({settings.aiTemperature})
              </label>
              <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
                Controls creativity vs consistency (0 = focused, 1 = creative)
              </p>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.aiTemperature}
                onChange={(e) => updateSettings({ aiTemperature: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                AI Bubble Trigger
              </label>
              <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
                Choose when the AI contextual bubble appears
              </p>
              <div className="flex gap-3">
                {[
                  { value: 'selection', label: 'On Selection' },
                  { value: 'highlight', label: 'On Highlight' },
                  { value: 'shortcut', label: 'Via Shortcut' },
                ].map((trigger) => (
                  <button
                    key={trigger.value}
                    onClick={() => updateSettings({ aiTrigger: trigger.value })}
                    className="px-4 py-2 rounded-lg border-2 transition-all"
                    style={{
                      backgroundColor: settings.aiTrigger === trigger.value ? '#e4f6e5' : 'var(--bg-tertiary)',
                      color: settings.aiTrigger === trigger.value ? '#121421' : 'var(--text-secondary)',
                      borderColor: settings.aiTrigger === trigger.value ? '#8ef292' : 'transparent',
                    }}
                  >
                    {trigger.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Auto-Summarize Long Notes</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Automatically suggest summaries for notes over 1000 words
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSummarize}
                  onChange={(e) => updateSettings({ autoSummarize: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#63cdff]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#63cdff]"></div>
              </label>
            </div>

            <div className="pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
              <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Mindmap AI Options</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Auto-Organize on Add</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Automatically reorganize mindmap when adding new nodes
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.mindmapAutoOrganizeOnAdd}
                      onChange={(e) => updateSettings({ mindmapAutoOrganizeOnAdd: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#63cdff]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#63cdff]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Show Suggested Connections</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      AI suggests potential connections between mindmap nodes
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.mindmapShowSuggestedConnections}
                      onChange={(e) => updateSettings({ mindmapShowSuggestedConnections: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#63cdff]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#63cdff]"></div>
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

// Shortcuts Settings Component
function ShortcutsSettings({ settings, updateSettings }: any) {
  // Define all shortcuts from constants (simulating DEFAULT_SHORTCUTS)
  const shortcuts = [
    // General
    { category: 'General', label: 'New Note', key: 'Cmd+N', description: 'Create a new note' },
    { category: 'General', label: 'Search', key: 'Cmd+K', description: 'Open global search' },
    { category: 'General', label: "Today's Note", key: 'Cmd+T', description: 'Open or create today\'s note' },
    { category: 'General', label: 'Settings', key: 'Cmd+,', description: 'Open settings panel' },
    // Editor
    { category: 'Editor', label: 'Focus Mode', key: 'Cmd+\\', description: 'Toggle distraction-free writing' },
    { category: 'Editor', label: 'Bold', key: 'Cmd+B', description: 'Make selected text bold' },
    { category: 'Editor', label: 'Italic', key: 'Cmd+I', description: 'Make selected text italic' },
    { category: 'Editor', label: 'Underline', key: 'Cmd+U', description: 'Underline selected text' },
    { category: 'Editor', label: 'Code', key: 'Cmd+E', description: 'Format as inline code' },
    { category: 'Editor', label: 'Save', key: 'Cmd+S', description: 'Save current note' },
    { category: 'Editor', label: 'Toggle Blocks', key: 'Cmd+Shift+B', description: 'Switch to block mode' },
    { category: 'Editor', label: 'Toggle Sketch', key: 'Cmd+Shift+D', description: 'Switch to drawing canvas' },
    // AI
    { category: 'AI', label: 'AI Assistant', key: 'Cmd+Shift+A', description: 'Open AI assistant menu' },
    { category: 'AI', label: 'Summarize', key: 'Cmd+Shift+S', description: 'Summarize selected text' },
    { category: 'AI', label: 'Generate Mindmap', key: 'Cmd+Shift+M', description: 'Create mindmap from selection' },
    { category: 'AI', label: 'Generate Quiz', key: 'Cmd+Shift+Q', description: 'Create quiz from selection' },
    // Navigation
    { category: 'Navigation', label: 'Close Note', key: 'Esc', description: 'Close current note' },
    { category: 'Navigation', label: 'Next Note', key: 'Cmd+]', description: 'Navigate to next note' },
    { category: 'Navigation', label: 'Previous Note', key: 'Cmd+[', description: 'Navigate to previous note' },
  ];

  const categories = ['General', 'Editor', 'AI', 'Navigation'];

  // Format shortcut for display (Mac/Windows compatible)
  const formatShortcut = (key: string) => {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
    return key
      .replace(/Cmd/g, isMac ? '⌘' : 'Ctrl')
      .replace(/Shift/g, '⇧')
      .replace(/Alt/g, isMac ? '⌥' : 'Alt')
      .replace(/Esc/g, '⎋');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Keyboard Shortcuts</h2>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          Master QuickNotes with these powerful keyboard shortcuts
        </p>
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              {category}
            </h3>
            <div className="space-y-2">
              {shortcuts
                .filter((s) => s.category === category)
                .map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                  >
                    <div className="flex-1">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {shortcut.label}
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                        {shortcut.description}
                      </div>
                    </div>
                    <kbd
                      className="px-3 py-1.5 rounded font-mono text-sm border"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-primary)',
                      }}
                    >
                      {formatShortcut(shortcut.key)}
                    </kbd>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', borderLeft: '4px solid #63cdff' }}>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          💡 <strong>Tip:</strong> Shortcuts are platform-aware. On macOS, Cmd (⌘) is used, while on Windows/Linux, Ctrl is used instead.
        </p>
      </div>
    </div>
  );
}

// Advanced Settings Component
function AdvancedSettings({ settings, updateSettings }: any) {
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 5120 }); // in KB

  const calculateStorage = () => {
    const storageSize = new Blob([JSON.stringify(localStorage)]).size;
    const sizeInKB = Math.round(storageSize / 1024);
    setStorageInfo({ ...storageInfo, used: sizeInKB });
  };

  const handleExportAllData = () => {
    const exportData = {
      notes: localStorage.getItem('notes') || '[]',
      settings: localStorage.getItem('settings') || '{}',
      folders: localStorage.getItem('folders') || '[]',
      exportDate: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quicknotes-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importData = JSON.parse(e.target?.result as string);
            if (confirm('Import data? This will replace your current notes and settings.')) {
              if (importData.notes) localStorage.setItem('notes', importData.notes);
              if (importData.settings) localStorage.setItem('settings', importData.settings);
              if (importData.folders) localStorage.setItem('folders', importData.folders);
              alert('Data imported successfully! Please refresh the page.');
            }
          } catch (error) {
            alert('Invalid backup file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearCache = () => {
    if (confirm('Clear all cached data? Your notes and settings will be preserved.')) {
      // Preserve important data
      const notes = localStorage.getItem('notes');
      const settingsData = localStorage.getItem('settings');
      const folders = localStorage.getItem('folders');

      // Clear everything
      localStorage.clear();

      // Restore important data
      if (notes) localStorage.setItem('notes', notes);
      if (settingsData) localStorage.setItem('settings', settingsData);
      if (folders) localStorage.setItem('folders', folders);

      alert('Cache cleared successfully!');
      calculateStorage();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Advanced</h2>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        Performance optimizations, data management, and developer tools for power users.
      </p>

      <div className="space-y-4">
        {/* Performance Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Performance</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Reduce Animations</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Minimize animations for better performance and reduced motion
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reduceAnimations}
                  onChange={(e) => updateSettings({ reduceAnimations: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#63cdff]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#63cdff]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>GPU Acceleration</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Use hardware acceleration for smoother rendering (may increase battery usage)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.gpuAcceleration}
                  onChange={(e) => updateSettings({ gpuAcceleration: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#63cdff]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#63cdff]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Storage & Backup Section */}
        <div className="pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Storage & Backup</h3>

          <div className="space-y-4">
            {/* Storage Visualization */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Local Storage Usage
                </span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {storageInfo.used} KB / {storageInfo.total} KB
                </span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(storageInfo.used / storageInfo.total) * 100}%`,
                    backgroundColor: storageInfo.used / storageInfo.total > 0.8 ? '#ef4444' : '#63cdff',
                  }}
                />
              </div>
              <button
                onClick={calculateStorage}
                className="mt-3 text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  color: 'var(--text-primary)',
                }}
              >
                Refresh Usage
              </button>
            </div>

            {/* Backup Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportAllData}
                className="px-4 py-3 rounded-lg border-2 transition-all text-left"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Download className="w-4 h-4" style={{ color: '#63cdff' }} />
                  <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    Export All
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Download notes + settings
                </p>
              </button>

              <button
                onClick={handleImportData}
                className="px-4 py-3 rounded-lg border-2 transition-all text-left"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Upload className="w-4 h-4" style={{ color: '#8ef292' }} />
                  <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    Import Backup
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Restore from file
                </p>
              </button>
            </div>

            <button
              onClick={handleClearCache}
              className="w-full px-4 py-3 rounded-lg border-2 transition-all text-left border-orange-300 hover:border-orange-400"
              style={{ backgroundColor: '#fff7ed' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <RotateCcw className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-sm text-orange-900">Clear Cache</span>
              </div>
              <p className="text-xs text-orange-700">Remove temporary data while keeping notes safe</p>
            </button>
          </div>
        </div>

        {/* Developer Tools Section */}
        <div className="pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Developer Tools</h3>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Developer Mode</h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Show debug information, grid overlays, and performance metrics
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.developerMode}
                onChange={(e) => updateSettings({ developerMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#63cdff]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#63cdff]"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
