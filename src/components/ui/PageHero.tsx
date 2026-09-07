import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Button, buttonClassName, type ButtonVariant } from './Button';
import { Stat } from './Stat';
import type { CardRule } from './Card';
import { cn } from '@/lib/cn';

export interface PageHeroAction {
  label: string;
  to?: string;
  href?: string;
  onClick?: () => void;
}

export interface PageHeroStat {
  value: ReactNode;
  label: ReactNode;
  hint?: ReactNode;
  rule?: CardRule;
}

export interface PageHeroProps {
  eyebrow: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  primary?: PageHeroAction;
  secondary?: PageHeroAction;
  stats?: PageHeroStat[];
  children?: ReactNode;
  className?: string;
}

function Action({ action, variant }: { action: PageHeroAction; variant: ButtonVariant }) {
  if (action.to) {
    return (
      <Link to={action.to} className={buttonClassName(variant, 'lg')}>
        {action.label}
      </Link>
    );
  }
  if (action.href) {
    return (
      <a href={action.href} className={buttonClassName(variant, 'lg')}>
        {action.label}
      </a>
    );
  }
  return (
    <Button variant={variant} size="lg" onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

const statCols: Record<number, string> = {
  1: 'grid-cols-1 max-w-[360px]',
  2: 'grid-cols-1 sm:grid-cols-2 max-w-[720px]',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
};

export function PageHero({ eyebrow, icon, title, lead, primary, secondary, stats, children, className }: PageHeroProps) {
  const cols = stats ? statCols[Math.min(stats.length, 4)] : '';
  return (
    <header className={cn('reveal pt-6 pb-12 text-center md:pt-10 md:pb-16', className)}>
      <div className="flex flex-col items-center gap-4">
        <span className="eyebrow-pill">
          {icon}
          {eyebrow}
        </span>
        <h1 className="heading-display">{title}</h1>
        {lead && <p className="lead mx-auto max-w-[62ch]">{lead}</p>}
        {(primary || secondary) && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            {primary && <Action action={primary} variant="primary" />}
            {secondary && <Action action={secondary} variant="secondary" />}
          </div>
        )}
      </div>
      {stats && stats.length > 0 && (
        <div className={cn('mx-auto mt-10 grid gap-5', cols)}>
          {stats.map((s, i) => (
            <Stat key={i} card rule={s.rule ?? 'accent'} value={s.value} label={s.label} hint={s.hint} />
          ))}
        </div>
      )}
      {children && <div className="mt-10">{children}</div>}
    </header>
  );
}
