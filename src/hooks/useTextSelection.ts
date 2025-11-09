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

export function useTextSelection(containerRef: RefObject<HTMLElement>): UseTextSelectionReturn {
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<SelectionPosition | null>(null);

  const handleSelectionChange = useCallback(() => {
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
  }, [containerRef]);

  const clearSelection = useCallback(() => {
    setSelectedText('');
    setSelectionPosition(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  return { selectedText, selectionPosition, clearSelection };
}
