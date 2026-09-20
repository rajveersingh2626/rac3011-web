import { useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet, ScrollRestoration, type RouteObject } from 'react-router';
import { surfaceHref } from '@/app/host';
import { PublicLayout, PortalLayout, AdminLayout } from './layouts';
import { RequireAuth } from './guards';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoginPage } from '@/pages/portal/LoginPage';
import { RegisterPage } from '@/pages/portal/RegisterPage';
import { PendingPage } from '@/pages/portal/PendingPage';
import { ForgotPasswordPage } from '@/pages/portal/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/portal/ResetPasswordPage';
import { UiKitPage } from '@/pages/UiKitPage';
import { publicMainRouteObjects } from './publicMain.routes';
import { portalMemberRouteObjects } from './portalMember.routes';
import { portalAdminRouteObjects } from './portalAdmin.routes';
import DistrictApp from '@/district/App';

function RideSubdomainRedirect() {
  useEffect(() => {
    window.location.replace(surfaceHref('ride'));
  }, []);
  return null;
}

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
  { path: '/login', element: <Navigate to="/portal/login" replace /> },
  { path: '/admin/ride', element: <Navigate to="/portal/admin/ride" replace /> },
  { path: '/portal/ride', element: <Navigate to="/portal/admin/ride" replace /> },
  { path: '/ride', element: <RideSubdomainRedirect /> },
  { path: '/ride/*', element: <RideSubdomainRedirect /> },
  { path: '/delhi-meri-jaan', element: <RideSubdomainRedirect /> },
  { path: '/admin', element: <Navigate to="/portal/admin/clubs" replace /> },
  { path: '/portal/admin', element: <Navigate to="/portal/admin/clubs" replace /> },
  { path: '/forgot-password', element: <Navigate to="/portal/forgot-password" replace /> },
  { path: '/reset-password', element: <Navigate to="/portal/reset-password" replace /> },
  {
    element: <AuthLayout />,
    children: [
      { path: '/portal/login', element: <LoginPage /> },
      { path: '/portal/register', element: <RegisterPage /> },
      { path: '/portal/pending', element: <PendingPage /> },
      { path: '/portal/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/portal/reset-password', element: <ResetPasswordPage /> },
    ],
  },
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

import { RootErrorBoundary } from '@/components/ui/RootErrorBoundary';

export function createMainRouter() {
  return createBrowserRouter([
    {
      element: (
        <>
          <ScrollRestoration />
          <Outlet />
        </>
      ),
      errorElement: <RootErrorBoundary />,
      children: routes,
    },
  ]);
}
