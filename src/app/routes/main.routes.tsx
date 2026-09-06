import { createBrowserRouter, Outlet, ScrollRestoration, type RouteObject } from 'react-router';
import { PublicLayout, PortalLayout, AdminLayout } from './layouts';
import { RequireAuth } from './guards';
import { LoginPage } from '@/pages/portal/LoginPage';
import { RegisterPage } from '@/pages/portal/RegisterPage';
import { PendingPage } from '@/pages/portal/PendingPage';
import { UiKitPage } from '@/pages/UiKitPage';
import { publicMainRouteObjects } from './publicMain.routes';
import { portalMemberRouteObjects } from './portalMember.routes';
import { portalAdminRouteObjects } from './portalAdmin.routes';
import DistrictApp from '@/district/App';

// Outside PublicLayout: the district site renders its own chrome and self-routes via pushState.
const districtSitePaths = [
  '/',
  '/directory',
  '/map',
  '/heritage',
  '/initiatives',
  '/showcase',
  '/resources',
  '/calendar',
  '/governance',
  '/leadership',
];

const routes: RouteObject[] = [
  ...districtSitePaths.map((path) => ({ path, element: <DistrictApp /> })),
  { element: <PublicLayout />, children: publicMainRouteObjects },
  { path: '/portal/login', element: <LoginPage /> },
  { path: '/portal/register', element: <RegisterPage /> },
  { path: '/portal/pending', element: <PendingPage /> },
  {
    element: <RequireAuth />,
    children: [
      { element: <PortalLayout />, children: portalMemberRouteObjects },
      { element: <AdminLayout />, children: portalAdminRouteObjects },
    ],
  },
  { path: '/__ui', element: <UiKitPage /> },
  { path: '*', element: <DistrictApp /> },
];

export function createMainRouter() {
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
