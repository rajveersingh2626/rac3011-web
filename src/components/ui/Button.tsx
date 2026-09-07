import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link' | 'soft' | 'navy' | 'deep';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  block?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-accent text-accent-fg shadow-glow transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-0.5 hover:brightness-95',
  secondary: 'border-2 border-accent text-accent bg-transparent hover:bg-accent-soft',
  ghost: 'text-fg-2 bg-transparent hover:bg-accent-soft',
  danger: 'bg-danger text-white hover:opacity-90',
  link: 'text-accent bg-transparent px-0 hover:underline min-h-0',
  soft: 'bg-accent-soft text-accent-deep border border-line-accent',
  navy: 'bg-[#123499] text-white shadow-[0_6px_20px_rgba(18,52,153,0.25)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#0C2470]',
  deep: 'bg-gradient-deep text-white shadow-glow transition-[transform,filter] duration-200 hover:-translate-y-0.5 hover:brightness-95',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3.5 py-2 text-[12.5px]',
  md: 'min-h-11 px-5 py-3 text-[13.5px]',
  lg: 'min-h-[52px] px-[26px] py-[15px] text-[15px]',
};

export function buttonClassName(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', block?: boolean, className?: string): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-[8px] font-bold transition-colors select-none',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variantClass[variant],
    variant === 'link' ? 'text-[13.5px]' : sizeClass[size],
    block && 'w-full',
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, leading, trailing, block, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-variant={variant}
      className={buttonClassName(variant, size, block, className)}
      {...rest}
    >
      {loading ? <span aria-hidden className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" /> : leading}
      {children}
      {!loading && trailing}
    </button>
  );
});
