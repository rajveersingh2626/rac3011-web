import { createBrowserRouter, Outlet, ScrollRestoration, type RouteObject } from 'react-router';
import { SubdomainShell } from '@/components/layout/SubdomainShell';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UpcomingSubdomainPage } from '@/pages/subdomains/UpcomingSubdomainPage';

function DrishtiUpcoming() {
  return (
    <UpcomingSubdomainPage
      title="Project Drishti"
      category="Vision Care & Eye Health"
      tagline="100 Cataract Surgeries & District Community Eye Camps"
      description="Combating avoidable blindness across Delhi NCR through comprehensive screening clinics, prescription spectacles distribution, and 100 fully sponsored cataract surgeries."
      accentColor="#0044FF"
    />
  );
}

function Layout() {
  return (
    <SubdomainShell surface="drishti" title="Project Drishti" nav={[]}>
      <DrishtiUpcoming />
    </SubdomainShell>
  );
}

const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <DrishtiUpcoming /> },
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
