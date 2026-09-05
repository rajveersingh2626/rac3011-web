import type { ReactNode } from 'react';
import { createBrowserRouter, Outlet, ScrollRestoration, type RouteObject } from 'react-router';
import { SubdomainShell } from '@/components/layout/SubdomainShell';
import { ComingSoon } from '@/pages/ComingSoon';
import { NotFoundPage } from '@/pages/NotFoundPage';

const NAV = [
  { label: 'Incoming', to: '/incoming' },
  { label: 'Support club', to: '/support-club' },
  { label: 'Gallery', to: '/gallery' },
];

function Layout({ children }: { children: ReactNode }) {
  return (
    <SubdomainShell surface="ride" title="RIDE" nav={NAV}>
      {children}
    </SubdomainShell>
  );
}

const routes: RouteObject[] = [
  { index: true, element: <Layout><ComingSoon title="RIDE" /></Layout> },
  { path: '/incoming', element: <Layout><ComingSoon title="Incoming delegations" /></Layout> },
  { path: '/support-club', element: <Layout><ComingSoon title="Support club registration" /></Layout> },
  { path: '/gallery', element: <Layout><ComingSoon title="Gallery" /></Layout> },
  { path: '/admin', element: <Layout><ComingSoon title="RIDE admin" /></Layout> },
  { path: '*', element: <Layout><NotFoundPage /></Layout> },
];

export function createRideRouter() {
  return createBrowserRouter([
    {
      element: (
        <>
          <ScrollRestoration />
          <Outlet />
        </>
      ),
      children: routes,
    },
  ]);
}
