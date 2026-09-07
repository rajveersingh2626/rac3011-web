import { useEffect, type ReactNode } from 'react';
import { mainSiteHref, type Surface } from '@/app/host';
import { DistrictFrame } from './DistrictFrame';

export interface SubdomainNavLink {
  label: string;
  to: string;
  icon?: ReactNode;
}

export interface SubdomainShellProps {
  surface: Exclude<Surface, 'main'>;
  title: string;
  nav: SubdomainNavLink[];
  children: ReactNode;
}

export function SubdomainShell({ surface, title, nav, children }: SubdomainShellProps) {
  useEffect(() => {
    document.documentElement.setAttribute('data-surface', surface);
    return () => document.documentElement.removeAttribute('data-surface');
  }, [surface]);

  return (
    <DistrictFrame nav={{ links: nav, homeHref: mainSiteHref(), title }}>
      {children}
    </DistrictFrame>
  );
}
