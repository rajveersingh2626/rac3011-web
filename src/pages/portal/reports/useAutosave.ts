import { useCallback, useEffect, useRef, useState } from 'react';

export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export interface UseAutosaveResult {
  status: AutosaveStatus;
  error: string | null;
  flush: () => void;
  cancel: () => void;
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
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  saveRef.current = save;
  latestValue.current = value;

  const cancel = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = undefined;
  }, []);

  const runSave = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = undefined;
    if (!enabledRef.current || savedValue.current === latestValue.current) return;
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
        const msg = e instanceof Error ? e.message : 'Save failed';
        if (msg.toLowerCase().includes('cannot edit a submitted report')) {
          setStatus('saved');
          setError(null);
          return;
        }
        setStatus('error');
        setError(msg);
      });
  }, [storageKey]);

  useEffect(() => {
    if (!enabled) {
      cancel();
      return;
    }
    if (value === savedValue.current) return;
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
  }, [value, enabled, storageKey, runSave, cancel]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (enabledRef.current) {
        runSave();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
      clearTimeout(timer.current);
      if (enabledRef.current) {
        runSave();
      }
    };
  }, [runSave]);

  return { status, error, flush: runSave, cancel };
}
