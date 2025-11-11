'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Move, Maximize2 } from 'lucide-react';

interface InlineImageProps {
  id: string;
  src: string;
  name: string;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  onRemove: (id: string) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onSizeChange: (id: string, size: { width: number; height: number }) => void;
}

export function InlineImage({
  id,
  src,
  name,
  initialPosition = { x: 20, y: 100 },
  initialSize = { width: 300, height: 200 },
  onRemove,
  onPositionChange,
  onSizeChange,
}: InlineImageProps) {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = imageRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
    setIsResizing(true);
  };

  // Handle mouse move (dragging or resizing)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        };
        setPosition(newPosition);
        onPositionChange(id, newPosition);
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        const newSize = {
          width: Math.max(100, resizeStart.width + deltaX),
          height: Math.max(100, resizeStart.height + deltaY),
        };
        setSize(newSize);
        onSizeChange(id, newSize);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, id, onPositionChange, onSizeChange]);

  return (
    <motion.div
      ref={imageRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: isDragging || isResizing ? 1000 : 10,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      className="group rounded-lg overflow-visible shadow-lg"
      onMouseDown={handleMouseDown}
    >
      {/* Image Container */}
      <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-gray-200 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Hover Controls */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />

        {/* Top Bar with Controls */}
        <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4 text-white" />
              <span className="text-xs text-white font-medium truncate max-w-[180px]">
                {name}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
              }}
              className="p-1 bg-red-500 hover:bg-red-600 rounded-full transition-colors pointer-events-auto"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="resize-handle absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-nwse-resize pointer-events-auto flex items-center justify-center"
          onMouseDown={handleResizeStart}
        >
          <Maximize2 className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Shadow/Border when dragging */}
      {(isDragging || isResizing) && (
        <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
      )}
    </motion.div>
  );
}
