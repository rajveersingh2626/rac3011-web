import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type CardTone = 'plain' | 'action' | 'dashed';
export type CardRule = 'pink' | 'navy' | 'cranberry' | 'accent' | 'none';

export interface CardProps {
  as?: ElementType;
  tone?: CardTone;
  rule?: CardRule;
  eyebrow?: ReactNode;
  title?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
}

const toneClass: Record<CardTone, string> = {
  plain: 'bg-surface border border-line-accent shadow-raised',
  action: 'bg-accent-soft border border-accent',
  dashed: 'bg-transparent border border-dashed border-line',
};

const ruleClass: Record<Exclude<CardRule, 'none'>, string> = {
  pink: 'border-t-4 border-t-[var(--rule-pink)]',
  navy: 'border-t-4 border-t-[var(--rule-navy)]',
  cranberry: 'border-t-4 border-t-[var(--rule-cranberry)]',
  accent: 'border-t-4 border-t-[var(--accent)]',
};

export function Card({
  as = 'div',
  tone = 'plain',
  rule = 'none',
  eyebrow,
  title,
  footer,
  children,
  className,
  href,
  target,
  rel,
  onClick,
}: CardProps) {
  const Tag = as;
  const interactive = Boolean(href || onClick);
  const ruled = rule !== 'none';
  return (
    <Tag
      data-tone={tone}
      data-rule={rule}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      className={cn(
        'rounded-[16px] p-5',
        toneClass[tone],
        ruled && ruleClass[rule],
        ruled && 'shadow-lift',
        href && !ruled && 'transition-colors hover:border-accent',
        ruled && interactive && 'transition-transform duration-300 hover:-translate-y-1',
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            'm-0 mb-1.5 text-[10px] font-extrabold uppercase tracking-[1.2px]',
            ruled ? 'text-accent' : 'text-[#123499]',
          )}
        >
          {eyebrow}
        </p>
      )}
      {title && <h3 className="m-0 text-[15.5px] font-extrabold leading-[1.35] text-fg">{title}</h3>}
      {children && <div className={cn('text-[13.5px] text-fg-2', Boolean(title || eyebrow) && 'mt-2')}>{children}</div>}
      {footer && <div className="mt-3.5 flex flex-wrap items-center gap-2.5">{footer}</div>}
    </Tag>
  );
}
