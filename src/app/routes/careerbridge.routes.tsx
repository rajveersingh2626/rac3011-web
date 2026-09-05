import type { ReactNode } from 'react';
import { createBrowserRouter, Outlet, ScrollRestoration, type RouteObject } from 'react-router';
import { SubdomainShell } from '@/components/layout/SubdomainShell';
import { ComingSoon } from '@/pages/ComingSoon';
import { NotFoundPage } from '@/pages/NotFoundPage';

const NAV = [
  { label: 'Opportunities', to: '/opportunities' },
  { label: 'Post an opening', to: '/post' },
];

function Layout({ children }: { children: ReactNode }) {
  return (
    <SubdomainShell surface="careerbridge" title="Career Bridge" nav={NAV}>
      {children}
    </SubdomainShell>
  );
}

const routes: RouteObject[] = [
  { index: true, element: <Layout><ComingSoon title="Career Bridge" /></Layout> },
  { path: '/opportunities', element: <Layout><ComingSoon title="Opportunities" /></Layout> },
  { path: '/opportunities/:id', element: <Layout><ComingSoon title="Opportunity" /></Layout> },
  { path: '/post', element: <Layout><ComingSoon title="Post an opening" /></Layout> },
  { path: '/admin', element: <Layout><ComingSoon title="Career Bridge admin" /></Layout> },
  { path: '*', element: <Layout><NotFoundPage /></Layout> },
];

export function createCareerbridgeRouter() {
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
