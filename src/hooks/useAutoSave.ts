import { useEffect, useRef, useState } from 'react';

export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => void,
  delay: number = 500
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      setIsSaving(true);
      onSave(dataRef.current);
      setLastSaved(new Date());
      setTimeout(() => setIsSaving(false), 1000);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, onSave]);

  return { isSaving, lastSaved };
}
