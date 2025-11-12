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

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() || '';

    if (!text) {
      setSelectedText('');
      setSelectionPosition(null);
      return;
    }

    // Check if selection is from a textarea or input
    const activeElement = document.activeElement;

    if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
      // Handle textarea/input selection
      const textareaElement = activeElement as HTMLTextAreaElement | HTMLInputElement;

      // Check if this textarea is within our container
      const isWithinContainer = containerRef.current && containerRef.current.contains(textareaElement);

      if (!isWithinContainer) {
        setSelectedText('');
        setSelectionPosition(null);
        return;
      }

      // Calculate position from textarea element
      const textareaRect = textareaElement.getBoundingClientRect();

      // For textarea, position the bubble at the center-top of the textarea
      // In a future improvement, we could calculate exact cursor position
      const position = {
        x: textareaRect.left + textareaRect.width / 2,
        y: textareaRect.top,
      };

      setSelectedText(text);
      setSelectionPosition(position);
    } else if (selection && selection.rangeCount > 0) {
      // Handle regular DOM selection (non-textarea)
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Check if selection is within our container
      const isWithinContainer = containerRef.current && containerRef.current.contains(range.commonAncestorContainer);

      if (isWithinContainer && rect.width > 0 && rect.height > 0) {
        setSelectedText(text);

        const position = {
          x: rect.left + rect.width / 2,
          y: rect.top,
        };
        setSelectionPosition(position);
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
