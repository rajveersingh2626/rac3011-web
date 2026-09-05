import { createBrowserRouter, Outlet, ScrollRestoration, type RouteObject } from 'react-router';
import { PublicLayout, PortalLayout, AdminLayout } from './layouts';
import { RequireAuth } from './guards';
import { LoginPage } from '@/pages/portal/LoginPage';
import { RegisterPage } from '@/pages/portal/RegisterPage';
import { PendingPage } from '@/pages/portal/PendingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UiKitPage } from '@/pages/UiKitPage';
import { publicMainRouteObjects } from './publicMain.routes';
import { portalMemberRouteObjects } from './portalMember.routes';
import { portalAdminRouteObjects } from './portalAdmin.routes';

const routes: RouteObject[] = [
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
  { path: '*', element: <NotFoundPage /> },
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
