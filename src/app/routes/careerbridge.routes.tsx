import { createBrowserRouter, Outlet, ScrollRestoration, type RouteObject } from 'react-router';
import { SubdomainShell } from '@/components/layout/SubdomainShell';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UpcomingSubdomainPage } from '@/pages/subdomains/UpcomingSubdomainPage';

function CareerBridgeUpcoming() {
  return (
    <UpcomingSubdomainPage
      title="Career Bridge"
      category="Youth Vocational & Professional Development"
      tagline="Rotary Mentorship, Executive Masterclasses & Corporate Internships"
      description="Connecting aspiring Rotaract students and young professionals directly with Rotarian corporate leaders, industry mentors, CV masterclasses, and verified job opportunities."
      accentColor="#123499"
    />
  );
}

function Layout() {
  return (
    <SubdomainShell surface="careerbridge" title="Career Bridge" nav={[]}>
      <CareerBridgeUpcoming />
    </SubdomainShell>
  );
}

const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <CareerBridgeUpcoming /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export function createCareerbridgeRouter() {
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
