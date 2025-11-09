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
    console.log('🔍 [useTextSelection] Selection change detected');

    const selection = window.getSelection();
    const text = selection?.toString().trim() || '';

    console.log('📝 [useTextSelection] Selected text:', text);
    console.log('📊 [useTextSelection] Selection object:', selection);
    console.log('🎯 [useTextSelection] Range count:', selection?.rangeCount);

    if (!text) {
      console.log('⚠️ [useTextSelection] No text selected - clearing');
      setSelectedText('');
      setSelectionPosition(null);
      return;
    }

    // Check if selection is from a textarea or input
    const activeElement = document.activeElement;
    console.log('🎯 [useTextSelection] Active element:', activeElement?.tagName);

    if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
      // Handle textarea/input selection
      const textareaElement = activeElement as HTMLTextAreaElement | HTMLInputElement;
      const start = textareaElement.selectionStart || 0;
      const end = textareaElement.selectionEnd || 0;

      console.log('📝 [useTextSelection] Textarea selection range:', { start, end });

      // Check if this textarea is within our container
      const isWithinContainer = containerRef.current && containerRef.current.contains(textareaElement);
      console.log('✅ [useTextSelection] Is textarea within container?', isWithinContainer);

      if (!isWithinContainer) {
        console.log('❌ [useTextSelection] Textarea outside container - clearing');
        setSelectedText('');
        setSelectionPosition(null);
        return;
      }

      // Calculate position from textarea element
      const textareaRect = textareaElement.getBoundingClientRect();
      console.log('📐 [useTextSelection] Textarea rect:', textareaRect);

      // For textarea, position the bubble at the center-top of the textarea
      // In a future improvement, we could calculate exact cursor position
      const position = {
        x: textareaRect.left + textareaRect.width / 2,
        y: textareaRect.top,
      };

      console.log('🎉 [useTextSelection] Setting selected text and position for textarea!');
      console.log('📍 [useTextSelection] Calculated position:', position);

      setSelectedText(text);
      setSelectionPosition(position);
    } else if (selection && selection.rangeCount > 0) {
      // Handle regular DOM selection (non-textarea)
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      console.log('📐 [useTextSelection] Selection rect:', rect);
      console.log('🎯 [useTextSelection] Common ancestor:', range.commonAncestorContainer);
      console.log('📦 [useTextSelection] Container ref current:', containerRef.current);

      // Check if selection is within our container
      const isWithinContainer = containerRef.current && containerRef.current.contains(range.commonAncestorContainer);
      console.log('✅ [useTextSelection] Is within container?', isWithinContainer);

      if (isWithinContainer && rect.width > 0 && rect.height > 0) {
        console.log('🎉 [useTextSelection] Setting selected text and position!');
        setSelectedText(text);

        const position = {
          x: rect.left + rect.width / 2,
          y: rect.top,
        };
        console.log('📍 [useTextSelection] Calculated position:', position);
        setSelectionPosition(position);
      } else {
        console.log('❌ [useTextSelection] Selection outside container or invalid rect - clearing');
        setSelectedText('');
        setSelectionPosition(null);
      }
    } else {
      console.log('⚠️ [useTextSelection] Invalid selection - clearing');
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
