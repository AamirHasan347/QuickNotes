import React from 'react';
import { motion } from 'framer-motion';
import {
  Pen,
  Eraser,
  Highlighter,
  Minus,
  Square,
  Circle,
  Trash2,
  Undo2,
  Redo2,
} from 'lucide-react';
import { DrawingTool } from '@/hooks/useInfiniteCanvas';

interface QuickSketchToolbarProps {
  // Current state
  currentTool: DrawingTool;
  currentColor: string;
  currentWidth: number;

  // Actions
  onToolChange: (tool: DrawingTool) => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onClearAll: () => void;
  onUndo: () => void;
  onRedo: () => void;

  // Undo/Redo state
  canUndo: boolean;
  canRedo: boolean;
}

// Color palette matching QuickNotes theme
const COLORS = [
  { name: 'Black', value: '#121421' },
  { name: 'Blue', value: '#63cdff' },
  { name: 'Green', value: '#8ef292' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Yellow', value: '#fbbf24' },
  { name: 'Pink', value: '#ec4899' },
];

// Stroke widths
const WIDTHS = [
  { label: 'Thin', value: 2 },
  { label: 'Medium', value: 4 },
  { label: 'Thick', value: 6 },
  { label: 'Extra Thick', value: 10 },
];

const QuickSketchToolbar: React.FC<QuickSketchToolbarProps> = ({
  currentTool,
  currentColor,
  currentWidth,
  onToolChange,
  onColorChange,
  onWidthChange,
  onClearAll,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const tools: { icon: React.ReactNode; value: DrawingTool; label: string }[] = [
    { icon: <Pen className="w-5 h-5" />, value: 'pen', label: 'Pen' },
    { icon: <Eraser className="w-5 h-5" />, value: 'eraser', label: 'Eraser' },
    { icon: <Highlighter className="w-5 h-5" />, value: 'highlighter', label: 'Highlighter' },
    { icon: <Minus className="w-5 h-5" />, value: 'line', label: 'Line' },
    { icon: <Square className="w-5 h-5" />, value: 'rectangle', label: 'Rectangle' },
    { icon: <Circle className="w-5 h-5" />, value: 'circle', label: 'Circle' },
  ];

  return (
    <div className="flex items-center gap-3 px-4 py-2 overflow-x-auto" style={{
      backgroundColor: 'var(--bg-tertiary)',
      borderBottom: '1px solid var(--border-primary)'
    }}>
      {/* Drawing Tools */}
      <div className="flex gap-1">
        {tools.map((tool) => (
          <motion.button
            key={tool.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToolChange(tool.value)}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: currentTool === tool.value ? 'var(--accent-light)' : 'transparent',
              color: currentTool === tool.value ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}
            onMouseEnter={(e) => {
              if (currentTool !== tool.value) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={(e) => {
              if (currentTool !== tool.value) e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={tool.label}
          >
            {tool.icon}
          </motion.button>
        ))}
      </div>

      <div className="h-6 w-px" style={{ backgroundColor: 'var(--border-primary)' }} />

      {/* Color Picker */}
      <div className="flex gap-1">
        {COLORS.map((color) => (
          <motion.button
            key={color.value}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onColorChange(color.value)}
            className="w-7 h-7 rounded-full border-2 transition-all"
            style={{
              backgroundColor: color.value,
              borderColor: currentColor === color.value ? 'var(--text-primary)' : 'var(--border-primary)',
              boxShadow: currentColor === color.value ? '0 0 0 2px rgba(99, 205, 255, 0.3)' : 'none'
            }}
            title={color.name}
          />
        ))}
      </div>

      <div className="h-6 w-px" style={{ backgroundColor: 'var(--border-primary)' }} />

      {/* Stroke Width Selector */}
      <div className="flex gap-1">
        {WIDTHS.map((width) => (
          <motion.button
            key={width.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onWidthChange(width.value)}
            className="p-2 rounded-lg transition-colors flex items-center justify-center"
            style={{
              backgroundColor: currentWidth === width.value ? 'var(--accent-light)' : 'transparent',
              color: currentWidth === width.value ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}
            onMouseEnter={(e) => {
              if (currentWidth !== width.value) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={(e) => {
              if (currentWidth !== width.value) e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={width.label}
          >
            <div
              className="rounded-full bg-current"
              style={{
                width: `${width.value + 4}px`,
                height: `${width.value + 4}px`,
              }}
            />
          </motion.button>
        ))}
      </div>

      <div className="h-6 w-px" style={{ backgroundColor: 'var(--border-primary)' }} />

      {/* Action Buttons */}
      <div className="flex gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded-lg transition-colors"
          style={{
            color: canUndo ? 'var(--text-secondary)' : 'var(--text-tertiary)',
            opacity: canUndo ? 1 : 0.4,
            cursor: canUndo ? 'pointer' : 'not-allowed'
          }}
          onMouseEnter={(e) => {
            if (canUndo) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
          }}
          onMouseLeave={(e) => {
            if (canUndo) e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Undo"
        >
          <Undo2 className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded-lg transition-colors"
          style={{
            color: canRedo ? 'var(--text-secondary)' : 'var(--text-tertiary)',
            opacity: canRedo ? 1 : 0.4,
            cursor: canRedo ? 'pointer' : 'not-allowed'
          }}
          onMouseEnter={(e) => {
            if (canRedo) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
          }}
          onMouseLeave={(e) => {
            if (canRedo) e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Redo"
        >
          <Redo2 className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClearAll}
          className="p-2 rounded-lg transition-colors text-red-600"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Clear All"
        >
          <Trash2 className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default QuickSketchToolbar;
