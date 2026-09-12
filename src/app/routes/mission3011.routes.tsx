import { createBrowserRouter, Outlet, ScrollRestoration, type RouteObject } from 'react-router';
import { SubdomainShell } from '@/components/layout/SubdomainShell';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UpcomingSubdomainPage } from '@/pages/subdomains/UpcomingSubdomainPage';

function Mission3011Upcoming() {
  return (
    <UpcomingSubdomainPage
      title="Mission 3011"
      category="Healthcare & Life-Saving Movement"
      tagline="District-Wide Blood Donation Campaign (Target: 3,011 Units)"
      description="A district-wide movement uniting all 4 zones and clubs to organize certified blood donation drives and contribute 3,011 life-saving units."
      accentColor="#E11D74"
    />
  );
}

function Layout() {
  return (
    <SubdomainShell surface="mission3011" title="Mission 3011" nav={[]}>
      <Mission3011Upcoming />
    </SubdomainShell>
  );
}

const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <Mission3011Upcoming /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export function createMission3011Router() {
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
