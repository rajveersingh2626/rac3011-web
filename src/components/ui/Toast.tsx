import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ToastTone = 'success' | 'info' | 'error';

export interface ToastOptions {
  title: ReactNode;
  body?: ReactNode;
  tone?: ToastTone;
  duration?: number;
}

interface ToastRecord extends ToastOptions {
  id: string;
}

interface ToastApi {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const toneClass: Record<ToastTone, string> = {
  success: 'border-line-accent',
  info: 'border-line',
  error: 'border-danger',
};

export function Toast({ title, body, tone = 'success', onDismiss }: ToastOptions & { onDismiss: () => void }) {
  return (
    <li
      data-tone={tone}
      className={cn('flex items-start gap-[14px] rounded-[12px] border bg-surface p-[14px] shadow-overlay', toneClass[tone])}
    >
      <div className="flex-1">
        <p className="text-[13.5px] font-bold text-fg">{title}</p>
        {body ? <p className="mt-[2px] text-[11.5px] text-fg-2">{body}</p> : null}
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={onDismiss}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[8px] text-fg-3 transition-colors hover:bg-accent-soft [&>svg]:size-[16px]"
      >
        <X />
      </button>
    </li>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const seq = useRef(0);

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      seq.current += 1;
      const id = `toast-${seq.current}`;
      setToasts((current) => [...current, { ...options, id }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), options.duration ?? 5000),
      );
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => clearTimeout(timer));
      map.clear();
    };
  }, []);

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  // Deferred to after mount: a portal rendered during hydration is reconciled against the
  // prerendered DOM's leftover nodes and fails to claim one, which aborts the whole hydration.
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  useEffect(() => setPortalTarget(document.body), []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {portalTarget
        ? createPortal(
            <div
              role="region"
              aria-label="Notifications"
              className="pointer-events-none fixed top-4 left-4 right-4 z-50 md:top-auto md:right-6 md:bottom-6 md:left-auto md:w-[360px]"
            >
              <ul aria-live="polite" aria-atomic="false" className="pointer-events-auto m-0 flex list-none flex-col gap-[9px] p-0">
                {toasts.map((t) => (
                  <Toast key={t.id} title={t.title} body={t.body} tone={t.tone} onDismiss={() => dismiss(t.id)} />
                ))}
              </ul>
            </div>,
            portalTarget,
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
