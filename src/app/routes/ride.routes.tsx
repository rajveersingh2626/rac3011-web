import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet, ScrollRestoration, useLocation, type RouteObject } from 'react-router';
import { Plane, Handshake, Images, ShieldCheck, Compass } from 'lucide-react';
import { SubdomainShell } from '@/components/layout/SubdomainShell';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useAuth } from '@/app/auth';
import { RequirePermission } from './guards';
import { RequireSubdomainAuth } from './subdomainGuards';
import { SurfaceLoading } from './SurfaceLoading';

const RideHomePage = lazy(() => import('@/pages/ride/RideHomePage').then((m) => ({ default: m.RideHomePage })));
const RideIncomingPage = lazy(() => import('@/pages/ride/RideIncomingPage').then((m) => ({ default: m.RideIncomingPage })));
const SupportClubPage = lazy(() => import('@/pages/ride/SupportClubPage').then((m) => ({ default: m.SupportClubPage })));
const RideGalleryPage = lazy(() => import('@/pages/ride/RideGalleryPage').then((m) => ({ default: m.RideGalleryPage })));
const RideAdminPage = lazy(() => import('@/pages/ride/RideAdminPage').then((m) => ({ default: m.RideAdminPage })));

const MANAGE_SCOPE = { type: 'project', id: 'ride' } as const;

function RideSubpageHeader() {
  const { can } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#171515] bg-[#FDFBF7]/95 px-4 py-3 backdrop-blur-md sm:px-8 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <a href="/" className="inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <img src="/ride/logos/2026_logo_not_coloured.png" alt="RIDE" className="h-8 sm:h-9 w-auto object-contain" />
          <span className="font-ride-sans text-base font-black text-[#171515] sm:text-lg">
            THE RIDE <span className="text-[#C72425]">•</span> RID 3011
          </span>
        </a>
        <nav className="flex items-center gap-4 text-xs font-black uppercase tracking-wider sm:gap-6 sm:text-sm text-[#171515]">
          <a href="/" className="hover:text-[#EA6623]">Home</a>
          <a href="/incoming" className="hover:text-[#EA6623]">Incoming</a>
          <a href="/gallery" className="hover:text-[#EA6623]">Gallery</a>
          {can('subdomain:ride:manage', MANAGE_SCOPE) && (
            <a href="/admin" className="text-[#19539D] hover:underline">Admin</a>
          )}
        </nav>
      </div>
    </header>
  );
}

function Layout() {
  const { can } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/delhi-meri-jaan';

  const nav = [
    { label: 'Delhi Meri Jaan', to: '/', icon: <Compass size={18} /> },
    { label: 'Incoming', to: '/incoming', icon: <Plane size={18} /> },
    { label: 'Support club', to: '/support-club', icon: <Handshake size={18} /> },
    { label: 'Gallery', to: '/gallery', icon: <Images size={18} /> },
    ...(can('subdomain:ride:manage', MANAGE_SCOPE)
      ? [{ label: 'Admin', to: '/admin', icon: <ShieldCheck size={18} /> }]
      : []),
  ];
  return (
    <SubdomainShell surface="ride" title="RIDE: Delhi Meri Jaan" nav={nav}>
      {!isHomePage && <RideSubpageHeader />}
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
      { index: true, element: <RideHomePage /> },
      { path: '/delhi-meri-jaan', element: <RideHomePage /> },
      { path: '/incoming', element: <RideIncomingPage /> },
      { path: '/gallery', element: <RideGalleryPage /> },
      {
        element: <RequireSubdomainAuth />,
        children: [
          { path: '/support-club', element: <SupportClubPage /> },
          {
            element: <RequirePermission perm="subdomain:ride:manage" scope={MANAGE_SCOPE} />,
            children: [{ path: '/admin', element: <RideAdminPage /> }],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export function createRideRouter() {
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
