import type { ButtonHTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  selected?: boolean;
  count?: number;
  label?: string;
  onRemove?: () => void;
  children?: ReactNode;
}

function textOf(label: string | undefined, children: ReactNode): string {
  if (label !== undefined) return label;
  return typeof children === 'string' ? children : '';
}

export function Chip({ selected, count, label, onRemove, children, className, disabled, type = 'button', ...rest }: ChipProps) {
  const name = textOf(label, children);

  const remove = (e: MouseEvent<HTMLSpanElement> | KeyboardEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    if (!disabled) onRemove?.();
  };

  return (
    <button
      type={type}
      aria-pressed={!!selected}
      disabled={disabled}
      data-selected={selected || undefined}
      className={cn(
        'inline-flex min-h-11 select-none items-center gap-1.5 rounded-[5px] border px-3 text-[12.5px] font-bold transition-colors',
        selected
          ? 'bg-accent border-accent text-accent-fg'
          : 'bg-transparent border-line-accent text-fg-2 hover:bg-accent-soft',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
      {...rest}
    >
      <span>{label ?? children}</span>
      {count !== undefined && (
        <span
          className={cn(
            'rounded-[999px] px-1.5 text-[11.5px] font-bold',
            selected ? 'bg-[rgba(255,255,255,0.22)] text-accent-fg' : 'bg-track text-accent-deep',
          )}
        >
          {count}
        </span>
      )}
      {onRemove && (
        <span
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={`Remove ${name}`}
          aria-disabled={disabled || undefined}
          onMouseDown={(e) => e.preventDefault()}
          onClick={remove}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              remove(e);
            }
          }}
          className="inline-flex size-6 items-center justify-center rounded-[4px] leading-none hover:bg-[rgba(0,0,0,0.08)]"
        >
          ×
        </span>
      )}
    </button>
  );
}
