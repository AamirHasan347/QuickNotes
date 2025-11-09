'use client';

import { useState, useEffect, useCallback, RefObject } from 'react';

interface SelectionPosition {
  x: number;
  y: number;
}

interface UseTextSelectionReturn {
  selectedText: string;
  selectionPosition: SelectionPosition | null;
  clearSelection: () => void;
}

export function useTextSelection(containerRef: RefObject<HTMLElement | null>): UseTextSelectionReturn {
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<SelectionPosition | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleSelectionChange = useCallback(() => {
    // Only process selection if user is actively selecting (mouse down/up)
    // This prevents the bubble from showing on right-click or other context menu selections
    if (!isMouseDown) {
      return;
    }

    const selection = window.getSelection();
    const text = selection?.toString().trim() || '';

    if (text && selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Check if selection is within our container
      if (containerRef.current && containerRef.current.contains(range.commonAncestorContainer)) {
        setSelectedText(text);

        // Position toolbar above the selection
        setSelectionPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 50, // 50px above the selection
        });
      } else {
        setSelectedText('');
        setSelectionPosition(null);
      }
    } else {
      setSelectedText('');
      setSelectionPosition(null);
    }
  }, [containerRef, isMouseDown]);

  const clearSelection = useCallback(() => {
    setSelectedText('');
    setSelectionPosition(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => {
      setIsMouseDown(false);
      // Trigger selection check on mouseup (after drag selection)
      setTimeout(handleSelectionChange, 10);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleSelectionChange]);

  return { selectedText, selectionPosition, clearSelection };
}
