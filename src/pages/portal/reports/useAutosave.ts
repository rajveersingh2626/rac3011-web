import { useCallback, useEffect, useRef, useState } from 'react';

export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export interface UseAutosaveResult {
  status: AutosaveStatus;
  error: string | null;
  flush: () => void;
}

const DEBOUNCE_MS = 2_000;

// Debounces a save call by DEBOUNCE_MS after every change, with localStorage fallback and flushing immediately on blur/unmount/beforeunload.
export function useAutosave<T>(
  value: T,
  save: (value: T) => Promise<unknown>,
  enabled = true,
  storageKey?: string,
): UseAutosaveResult {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latestValue = useRef(value);
  const savedValue = useRef(value);
  const saveRef = useRef(save);
  saveRef.current = save;
  latestValue.current = value;

  const runSave = useCallback(() => {
    clearTimeout(timer.current);
    if (savedValue.current === latestValue.current) return;
    const toSave = latestValue.current;
    setStatus('saving');
    saveRef.current(toSave)
      .then(() => {
        savedValue.current = toSave;
        setStatus('saved');
        setError(null);
        if (storageKey && typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem(storageKey);
          } catch {
            // ignore localStorage quota errors
          }
        }
      })
      .catch((e: unknown) => {
        setStatus('error');
        setError(e instanceof Error ? e.message : 'Save failed');
      });
  }, [storageKey]);

  useEffect(() => {
    if (!enabled || value === savedValue.current) return;
    setStatus('pending');

    // Immediate backup to localStorage so work is never lost even if browser crashes before network save
    if (storageKey && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(value));
      } catch {
        // ignore localStorage quota errors
      }
    }

    clearTimeout(timer.current);
    timer.current = setTimeout(runSave, DEBOUNCE_MS);
    return () => clearTimeout(timer.current);
  }, [value, enabled, storageKey, runSave]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      runSave();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
      clearTimeout(timer.current);
      runSave();
    };
  }, [runSave]);

  return { status, error, flush: runSave };
}
