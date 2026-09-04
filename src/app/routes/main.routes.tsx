import { createBrowserRouter, type RouteObject } from 'react-router';
import { PublicLayout, PortalLayout, AdminLayout } from './layouts';
import { RequireAuth } from './guards';
import { LoginPage } from '@/pages/portal/LoginPage';
import { ComingSoon } from '@/pages/ComingSoon';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UiKitPage } from '@/pages/UiKitPage';
import { publicMainRouteObjects } from './publicMain.routes';
import { portalMemberRouteObjects } from './portalMember.routes';
import { portalAdminRouteObjects } from './portalAdmin.routes';

const routes: RouteObject[] = [
  { element: <PublicLayout />, children: publicMainRouteObjects },
  { path: '/portal/login', element: <LoginPage /> },
  { path: '/portal/register', element: <ComingSoon title="Register" /> },
  { path: '/portal/pending', element: <ComingSoon title="Registration pending" /> },
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
  return createBrowserRouter(routes);
}
