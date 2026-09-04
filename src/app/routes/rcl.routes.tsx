import type { ReactNode } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router';
import { SubdomainShell } from '@/components/layout/SubdomainShell';
import { ComingSoon } from '@/pages/ComingSoon';
import { NotFoundPage } from '@/pages/NotFoundPage';

const NAV = [
  { label: 'Standings', to: '/standings' },
  { label: 'Fixtures', to: '/fixtures' },
  { label: 'Register', to: '/register' },
];

function Layout({ children }: { children: ReactNode }) {
  return (
    <SubdomainShell surface="rcl" title="Rotaract Champions League" nav={NAV}>
      {children}
    </SubdomainShell>
  );
}

const routes: RouteObject[] = [
  { index: true, element: <Layout><ComingSoon title="Rotaract Champions League" /></Layout> },
  { path: '/standings', element: <Layout><ComingSoon title="Standings" /></Layout> },
  { path: '/fixtures', element: <Layout><ComingSoon title="Fixtures" /></Layout> },
  { path: '/register', element: <Layout><ComingSoon title="Register a team" /></Layout> },
  { path: '*', element: <Layout><NotFoundPage /></Layout> },
];

export function createRclRouter() {
  return createBrowserRouter(routes);
}
