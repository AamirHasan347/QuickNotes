import { useEffect, useRef, useState } from 'react';

export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => void,
  options: {
    delay?: number;
    enabled?: boolean;
  } = {}
) {
  const { delay = 500, enabled = true } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const dataRef = useRef(data);
  const initialDataRef = useRef(data);

  useEffect(() => {
    const hasChanges = JSON.stringify(data) !== JSON.stringify(initialDataRef.current);
    setHasUnsavedChanges(hasChanges);
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only auto-save if enabled
    if (!enabled) {
      return;
    }

    if (!hasUnsavedChanges) {
      return;
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      setIsSaving(true);
      onSave(dataRef.current);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      initialDataRef.current = dataRef.current;
      setTimeout(() => setIsSaving(false), 1000);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, onSave, enabled, hasUnsavedChanges]);

  const manualSave = () => {
    if (!hasUnsavedChanges) return;

    setIsSaving(true);
    onSave(dataRef.current);
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
    initialDataRef.current = dataRef.current;
    setTimeout(() => setIsSaving(false), 500);
  };

  return { isSaving, lastSaved, hasUnsavedChanges, manualSave };
}
