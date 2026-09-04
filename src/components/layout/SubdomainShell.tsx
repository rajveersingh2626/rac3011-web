import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/app/auth';
import type { Surface } from '@/app/host';

export interface SubdomainNavLink {
  label: string;
  to: string;
}

export interface SubdomainShellProps {
  surface: Exclude<Surface, 'main'>;
  title: string;
  nav: SubdomainNavLink[];
  children: ReactNode;
}

function mainSiteHref(): string {
  const url = new URL(window.location.href);
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname.endsWith('.localhost')) {
    url.searchParams.delete('surface');
    url.pathname = '/';
    return url.toString();
  }
  const parts = url.hostname.split('.');
  url.hostname = parts.length > 2 ? parts.slice(1).join('.') : url.hostname;
  url.pathname = '/';
  return url.toString();
}

export function SubdomainShell({ surface, title, nav, children }: SubdomainShellProps) {
  const { me } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-surface', surface);
    return () => document.documentElement.removeAttribute('data-surface');
  }, [surface]);

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="flex h-14 items-center justify-between border-b border-line-accent bg-surface px-5 md:h-[60px] md:px-8 lg:h-[68px] lg:px-10">
        <div className="flex items-center gap-6 lg:gap-[34px]">
          <span className="text-[15px] font-extrabold text-accent">{title}</span>
          <nav aria-label="Primary" className="hidden items-center gap-6 text-[13.5px] font-semibold text-fg-2 lg:flex">
            {nav.map((link) => (
              <Link key={link.to} to={link.to} className="text-fg-2 transition-colors hover:text-accent">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-[12.5px] font-semibold">
          <a href={mainSiteHref()} className="text-fg-2 hover:text-accent">
            Main site
          </a>
          {me ? <span className="text-fg-3">{me.user.name}</span> : null}
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
