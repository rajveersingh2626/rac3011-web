import { createBrowserRouter, Outlet, ScrollRestoration, type RouteObject } from 'react-router';
import { SubdomainShell } from '@/components/layout/SubdomainShell';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UpcomingSubdomainPage } from '@/pages/subdomains/UpcomingSubdomainPage';

function RclUpcoming() {
  return (
    <UpcomingSubdomainPage
      title="Rotaract Cricket League (RCL)"
      category="District Sports Championship & Fellowship"
      tagline="Inter-Club Cricket Championship & Youth Sports Festival"
      description="District 3011’s marquee sports tournament fostering athletic grit, sportsmanship, and inter-club camaraderie on the cricket pitch."
      accentColor="#0044FF"
    />
  );
}

function Layout() {
  return (
    <SubdomainShell surface="rcl" title="Rotaract Cricket League" nav={[]}>
      <RclUpcoming />
    </SubdomainShell>
  );
}

const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <RclUpcoming /> },
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
