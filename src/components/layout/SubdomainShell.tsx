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
  hideFloatingNav?: boolean;
  fullBleed?: boolean;
  hideFooter?: boolean;
  children: ReactNode;
}

export function SubdomainShell({
  surface,
  title,
  nav,
  hideFloatingNav,
  fullBleed,
  hideFooter,
  children,
}: SubdomainShellProps) {
  useEffect(() => {
    document.documentElement.setAttribute('data-surface', surface);
    return () => document.documentElement.removeAttribute('data-surface');
  }, [surface]);

  const shouldHideFloatingNav = hideFloatingNav ?? (surface === 'ride');
  const shouldBeFullBleed = fullBleed ?? (surface === 'ride');
  const shouldHideFooter = hideFooter ?? (surface === 'ride');

  return (
    <DistrictFrame
      hideFloatingNav={shouldHideFloatingNav}
      fullBleed={shouldBeFullBleed}
      hideFooter={shouldHideFooter}
      nav={{ links: nav, homeHref: mainSiteHref(), title }}
    >
      {children}
    </DistrictFrame>
  );
}
