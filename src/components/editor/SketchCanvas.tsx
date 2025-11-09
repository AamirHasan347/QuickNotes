'use client';

import { useRef, useState } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eraser, Download, Trash2, Pencil, Palette } from 'lucide-react';
import { Drawing } from '@/lib/store/types';

interface SketchCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (drawing: Drawing) => void;
}

const COLORS = [
  '#000000', // Black
  '#FF0000', // Red
  '#0000FF', // Blue
  '#00FF00', // Green
  '#FFA500', // Orange
  '#800080', // Purple
  '#FFFF00', // Yellow
];

const STROKE_WIDTHS = [2, 4, 6, 8, 12];

export function SketchCanvas({ isOpen, onClose, onSave }: SketchCanvasProps) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [eraserMode, setEraserMode] = useState(false);

  const handleSave = async () => {
    if (!canvasRef.current) return;

    try {
      const dataUrl = await canvasRef.current.exportImage('png');
      const drawing: Drawing = {
        id: `drawing-${Date.now()}`,
        data: dataUrl,
        createdAt: new Date(),
      };
      onSave(drawing);
      onClose();
    } catch (error) {
      console.error('Error saving drawing:', error);
    }
  };

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleRedo = () => {
    canvasRef.current?.redo();
  };

  const toggleEraser = () => {
    setEraserMode(!eraserMode);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Sketch Mode</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-4">
                {/* Color Picker */}
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-gray-600" />
                  <div className="flex gap-1">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setStrokeColor(color);
                          setEraserMode(false);
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          strokeColor === color && !eraserMode
                            ? 'border-purple-600 scale-110'
                            : 'border-gray-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Stroke Width */}
                <div className="flex items-center gap-2 pl-4 border-l border-gray-300">
                  {STROKE_WIDTHS.map((width) => (
                    <button
                      key={width}
                      onClick={() => setStrokeWidth(width)}
                      className={`p-2 rounded-lg transition-all ${
                        strokeWidth === width
                          ? 'bg-purple-100 border-2 border-purple-600'
                          : 'hover:bg-gray-200'
                      }`}
                    >
                      <div
                        className="rounded-full bg-gray-800"
                        style={{ width: width * 2, height: width * 2 }}
                      />
                    </button>
                  ))}
                </div>

                {/* Eraser */}
                <button
                  onClick={toggleEraser}
                  className={`p-2 rounded-lg transition-all ${
                    eraserMode
                      ? 'bg-red-100 border-2 border-red-600'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  <Eraser className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndo}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Undo
                </button>
                <button
                  onClick={handleRedo}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Redo
                </button>
                <button
                  onClick={handleClear}
                  className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 p-4 bg-white overflow-hidden">
              <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-xl overflow-hidden">
                <ReactSketchCanvas
                  ref={canvasRef}
                  strokeColor={eraserMode ? '#FFFFFF' : strokeColor}
                  strokeWidth={eraserMode ? strokeWidth * 3 : strokeWidth}
                  eraserWidth={strokeWidth * 3}
                  canvasColor="#FFFFFF"
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Draw with your mouse or stylus. Click "Save Drawing" when done.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Save Drawing
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
