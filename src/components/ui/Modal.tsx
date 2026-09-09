import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useFocusTrap, useScrollLock } from './useFocusTrap';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
}

const sizeClass: Record<ModalSize, string> = {
  sm: 'max-w-[380px]',
  md: 'max-w-[520px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[960px]',
};

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const panelRef = useFocusTrap<HTMLDivElement>(open);
  const downOnBackdrop = useRef(false);
  const titleId = useId();
  const descId = useId();

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const onMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    downOnBackdrop.current = event.target === event.currentTarget;
  };
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (downOnBackdrop.current && event.target === event.currentTarget) onClose();
    downOnBackdrop.current = false;
  };

  return createPortal(
    <div
      data-testid="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[4px] p-4 sm:p-6"
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        data-size={size}
        className={cn(
          'w-full max-h-[88vh] flex flex-col rounded-[20px] bg-surface border border-line p-5 sm:p-7 shadow-overlay [[data-theme=dark]_&]:border-white/10',
          sizeClass[size],
        )}
      >
        <div className="shrink-0 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-[17px] font-extrabold text-fg m-0">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="mt-1.5 text-[13px] text-fg-2 m-0">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="shrink-0 rounded-lg p-1.5 text-fg-3 hover:bg-surface-2 hover:text-fg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {children ? (
          <div className="mt-4 overflow-y-auto flex-1 min-h-0 pr-1 text-[13.5px] text-fg-2 scrollbar-thin">
            {children}
          </div>
        ) : null}
        {footer ? (
          <div className="mt-5 shrink-0 flex flex-col gap-2.5 sm:flex-row sm:justify-end border-t border-line pt-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
