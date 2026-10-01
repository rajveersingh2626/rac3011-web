import { forwardRef, useId, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'type'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, onChange, label, description, className, disabled, id, ...rest },
  ref,
) {
  const auto = useId();
  const labelId = label ? `${auto}-label` : undefined;
  const descId = description ? `${auto}-desc` : undefined;
  return (
    <div
      data-switch-row
      data-disabled={disabled || undefined}
      className={cn('flex min-h-11 items-center justify-between gap-3', disabled && 'opacity-60', className)}
    >
      {(label || description) && (
        <span className="flex min-w-0 flex-col">
          {label && (
            <span id={labelId} className="text-[12.5px] font-bold leading-tight text-fg">
              {label}
            </span>
          )}
          {description && (
            <span id={descId} className="text-[11px] leading-snug text-fg-3">
              {description}
            </span>
          )}
        </span>
      )}
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={descId}
        disabled={disabled}
        data-state={checked ? 'on' : 'off'}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked
            ? 'bg-accent shadow-[0_0_12px_rgba(225,29,116,0.3)]'
            : 'bg-track dark:bg-surface-3 border border-border/70 hover:border-fg-3/40',
        )}
        {...rest}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.25),0_0_1px_rgba(0,0,0,0.2)] transition-transform duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
});

