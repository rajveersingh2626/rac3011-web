import type { ReactNode } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router';
import { SubdomainShell } from '@/components/layout/SubdomainShell';
import { ComingSoon } from '@/pages/ComingSoon';
import { NotFoundPage } from '@/pages/NotFoundPage';

const NAV = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Camps', to: '/camps' },
];

function Layout({ children }: { children: ReactNode }) {
  return (
    <SubdomainShell surface="mission3011" title="Mission 3011" nav={NAV}>
      {children}
    </SubdomainShell>
  );
}

const routes: RouteObject[] = [
  { index: true, element: <Layout><ComingSoon title="Mission 3011" /></Layout> },
  { path: '/dashboard', element: <Layout><ComingSoon title="Mission 3011 dashboard" /></Layout> },
  { path: '/camps', element: <Layout><ComingSoon title="Camps" /></Layout> },
  { path: '/admin', element: <Layout><ComingSoon title="Mission 3011 admin" /></Layout> },
  { path: '*', element: <Layout><NotFoundPage /></Layout> },
];

export function createMission3011Router() {
  return createBrowserRouter(routes);
}
