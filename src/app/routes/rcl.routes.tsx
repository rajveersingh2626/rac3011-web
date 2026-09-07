import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet, ScrollRestoration, type RouteObject } from 'react-router';
import { SubdomainShell } from '@/components/layout/SubdomainShell';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RequireSubdomainAuth } from './subdomainGuards';
import { SurfaceLoading } from './SurfaceLoading';

const StandingsPage = lazy(() => import('@/pages/rcl/StandingsPage').then((m) => ({ default: m.StandingsPage })));
const FixturesPage = lazy(() => import('@/pages/rcl/FixturesPage').then((m) => ({ default: m.FixturesPage })));
const RegisterPage = lazy(() => import('@/pages/rcl/RegisterPage').then((m) => ({ default: m.RegisterPage })));

const NAV = [
  { label: 'Standings', to: '/standings' },
  { label: 'Fixtures', to: '/fixtures' },
  { label: 'Register', to: '/register' },
];

function Layout() {
  return (
    <SubdomainShell surface="rcl" title="Rotaract Champions League" nav={NAV}>
      <Suspense fallback={<SurfaceLoading />}>
        <Outlet />
      </Suspense>
    </SubdomainShell>
  );
}

const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <StandingsPage /> },
      { path: '/standings', element: <StandingsPage /> },
      { path: '/fixtures', element: <FixturesPage /> },
      { element: <RequireSubdomainAuth />, children: [{ path: '/register', element: <RegisterPage /> }] },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export function createRclRouter() {
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
