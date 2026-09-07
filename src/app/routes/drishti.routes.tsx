import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet, ScrollRestoration, type RouteObject } from 'react-router';
import { LayoutDashboard, Users, Stethoscope } from 'lucide-react';
import { SubdomainShell } from '@/components/layout/SubdomainShell';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RequireSubdomainAuth } from './subdomainGuards';
import { SurfaceLoading } from './SurfaceLoading';

const DrishtiDashboardPage = lazy(() =>
  import('@/pages/drishti/DrishtiDashboardPage').then((m) => ({ default: m.DrishtiDashboardPage })),
);
const BeneficiariesPage = lazy(() =>
  import('@/pages/drishti/BeneficiariesPage').then((m) => ({ default: m.BeneficiariesPage })),
);
const SurgeriesPage = lazy(() => import('@/pages/drishti/SurgeriesPage').then((m) => ({ default: m.SurgeriesPage })));

const NAV = [
  { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Beneficiaries', to: '/beneficiaries', icon: <Users size={18} /> },
  { label: 'Surgeries', to: '/surgeries', icon: <Stethoscope size={18} /> },
];

function Layout() {
  return (
    <SubdomainShell surface="drishti" title="Project Drishti" nav={NAV}>
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
      { index: true, element: <DrishtiDashboardPage /> },
      { path: '/dashboard', element: <DrishtiDashboardPage /> },
      {
        element: <RequireSubdomainAuth />,
        children: [
          { path: '/beneficiaries', element: <BeneficiariesPage /> },
          { path: '/surgeries', element: <SurgeriesPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export function createDrishtiRouter() {
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
