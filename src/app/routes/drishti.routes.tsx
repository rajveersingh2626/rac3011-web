import type { ReactNode } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router';
import { SubdomainShell } from '@/components/layout/SubdomainShell';
import { ComingSoon } from '@/pages/ComingSoon';
import { NotFoundPage } from '@/pages/NotFoundPage';

const NAV = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Beneficiaries', to: '/beneficiaries' },
  { label: 'Surgeries', to: '/surgeries' },
];

function Layout({ children }: { children: ReactNode }) {
  return (
    <SubdomainShell surface="drishti" title="Project Drishti" nav={NAV}>
      {children}
    </SubdomainShell>
  );
}

const routes: RouteObject[] = [
  { index: true, element: <Layout><ComingSoon title="Project Drishti" /></Layout> },
  { path: '/dashboard', element: <Layout><ComingSoon title="Drishti dashboard" /></Layout> },
  { path: '/beneficiaries', element: <Layout><ComingSoon title="Beneficiaries" /></Layout> },
  { path: '/surgeries', element: <Layout><ComingSoon title="Surgery pipeline" /></Layout> },
  { path: '*', element: <Layout><NotFoundPage /></Layout> },
];

export function createDrishtiRouter() {
  return createBrowserRouter(routes);
}
