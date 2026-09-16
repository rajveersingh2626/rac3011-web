import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, Link, Outlet, ScrollRestoration, useLocation, type RouteObject } from 'react-router';
import { Images, Compass, LayoutDashboard } from 'lucide-react';
import { SubdomainShell } from '@/components/layout/SubdomainShell';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useAuth } from '@/app/auth';
import { portalHref } from '@/app/host';
import { SurfaceLoading } from './SurfaceLoading';

const RideHomePage = lazy(() => import('@/pages/ride/RideHomePage').then((m) => ({ default: m.RideHomePage })));
const RideGalleryPage = lazy(() => import('@/pages/ride/RideGalleryPage').then((m) => ({ default: m.RideGalleryPage })));
const RideParticipantDashboardPage = lazy(() =>
  import('@/pages/ride/RideParticipantDashboardPage').then((m) => ({ default: m.RideParticipantDashboardPage }))
);
const RideParticipantLoginPage = lazy(() =>
  import('@/pages/ride/RideParticipantLoginPage').then((m) => ({ default: m.RideParticipantLoginPage }))
);

function SubdomainAdminRedirect() {
  useEffect(() => {
    window.location.assign(portalHref('/portal/admin/ride'));
  }, []);
  return <SurfaceLoading />;
}

function RequireRideParticipantAuth() {
  const { status } = useAuth();
  if (status === 'loading') return <SurfaceLoading />;
  if (status !== 'authenticated') {
    return <RideParticipantLoginPage />;
  }
  return <Outlet />;
}

function RideSubpageHeader() {
  const { me } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#171515] bg-[#FDFBF7]/95 px-4 py-3 backdrop-blur-md sm:px-8 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <img src="/ride/logos/2026_logo_not_coloured.png" alt="RIDE" className="h-8 sm:h-9 w-auto object-contain" />
          <span className="font-ride-sans text-base font-black text-[#171515] sm:text-lg">
            THE RIDE <span className="text-[#C72425]">•</span> RID 3011
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-xs font-black uppercase tracking-wider sm:gap-6 sm:text-sm text-[#171515]">
          <Link to="/" className="hover:text-[#EA6623]">Home</Link>
          <Link to="/gallery" className="hover:text-[#EA6623]">Gallery</Link>
          <Link
            to="/dashboard"
            className="px-3.5 py-1.5 rounded-xl bg-[#19539D] text-white hover:bg-blue-800 transition-all font-black text-xs"
          >
            {me ? 'My Dashboard' : 'Participant Portal'}
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/delhi-meri-jaan';

  const nav = [
    { label: 'Delhi Meri Jaan', to: '/', icon: <Compass size={18} /> },
    { label: 'Gallery', to: '/gallery', icon: <Images size={18} /> },
    { label: 'Participant Portal', to: '/dashboard', icon: <LayoutDashboard size={18} /> },
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
      { path: '/gallery', element: <RideGalleryPage /> },
      { path: '/login', element: <RideParticipantLoginPage /> },
      {
        element: <RequireRideParticipantAuth />,
        children: [
          { path: '/dashboard', element: <RideParticipantDashboardPage /> },
        ],
      },
      // When an admin navigates to /admin on the subdomain, redirect to the main portal admin
      { path: '/admin', element: <SubdomainAdminRedirect /> },
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
