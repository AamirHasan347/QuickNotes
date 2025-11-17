'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export type AccentColor = 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'orange';

interface AccentColorPickerProps {
  selected: AccentColor;
  onChange: (color: AccentColor) => void;
}

interface ColorOption {
  id: AccentColor;
  name: string;
  primary: string;
  light: string;
  hover: string;
}

const colorOptions: ColorOption[] = [
  {
    id: 'purple',
    name: 'Purple',
    primary: '#8B5CF6',
    light: '#EDE9FE',
    hover: '#7C3AED',
  },
  {
    id: 'blue',
    name: 'Blue',
    primary: '#3B82F6',
    light: '#DBEAFE',
    hover: '#2563EB',
  },
  {
    id: 'green',
    name: 'Green',
    primary: '#10B981',
    light: '#D1FAE5',
    hover: '#059669',
  },
  {
    id: 'yellow',
    name: 'Yellow',
    primary: '#F59E0B',
    light: '#FEF3C7',
    hover: '#D97706',
  },
  {
    id: 'red',
    name: 'Red',
    primary: '#EF4444',
    light: '#FEE2E2',
    hover: '#DC2626',
  },
  {
    id: 'orange',
    name: 'Orange',
    primary: '#F97316',
    light: '#FFEDD5',
    hover: '#EA580C',
  },
];

export function AccentColorPicker({ selected, onChange }: AccentColorPickerProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        Accent Color
      </label>
      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
        Choose an accent color that will be applied throughout the app
      </p>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {colorOptions.map((color) => (
          <motion.button
            key={color.id}
            onClick={() => onChange(color.id)}
            className="relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={color.name}
          >
            {/* Color Swatch */}
            <div
              className="w-full aspect-square rounded-xl transition-all duration-200 shadow-md"
              style={{
                backgroundColor: color.primary,
                border: selected === color.id ? '3px solid var(--text-primary)' : '3px solid transparent',
                boxShadow: selected === color.id
                  ? `0 0 0 4px ${color.light}`
                  : 'none',
              }}
            >
              {/* Checkmark for selected color */}
              {selected === color.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                  >
                    <Check className="w-5 h-5" style={{ color: color.primary }} strokeWidth={3} />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Color Name */}
            <p
              className="text-xs text-center mt-2 font-medium"
              style={{
                color: selected === color.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {color.name}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Preview Section */}
      <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          Preview
        </p>
        <div className="flex items-center gap-3">
          {/* Primary Button Preview */}
          <button
            className="px-4 py-2 rounded-lg font-medium text-white transition-all"
            style={{
              backgroundColor: colorOptions.find((c) => c.id === selected)?.primary,
            }}
          >
            Primary Button
          </button>

          {/* Secondary Button Preview */}
          <button
            className="px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: colorOptions.find((c) => c.id === selected)?.light,
              color: colorOptions.find((c) => c.id === selected)?.primary,
            }}
          >
            Secondary
          </button>

          {/* Badge Preview */}
          <div
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: colorOptions.find((c) => c.id === selected)?.light,
              color: colorOptions.find((c) => c.id === selected)?.primary,
            }}
          >
            Badge
          </div>
        </div>
      </div>
    </div>
  );
}

// Export color values for use in ThemeProvider
export const ACCENT_COLOR_VALUES: Record<AccentColor, { primary: string; light: string; hover: string }> = {
  purple: { primary: '#8B5CF6', light: '#EDE9FE', hover: '#7C3AED' },
  blue: { primary: '#3B82F6', light: '#DBEAFE', hover: '#2563EB' },
  green: { primary: '#10B981', light: '#D1FAE5', hover: '#059669' },
  yellow: { primary: '#F59E0B', light: '#FEF3C7', hover: '#D97706' },
  red: { primary: '#EF4444', light: '#FEE2E2', hover: '#DC2626' },
  orange: { primary: '#F97316', light: '#FFEDD5', hover: '#EA580C' },
};
