import type { RouteObject } from 'react-router';
import { ComingSoon } from '@/pages/ComingSoon';

export const portalMemberRouteObjects: RouteObject[] = [
  { path: '/portal/dashboard', element: <ComingSoon title="Dashboard" /> },
  { path: '/portal/reports/new', element: <ComingSoon title="New report" /> },
  { path: '/portal/reports/:id/review', element: <ComingSoon title="Review report" /> },
  { path: '/portal/reports/history', element: <ComingSoon title="Report history" /> },
  { path: '/portal/reports/:id', element: <ComingSoon title="Report" /> },
  { path: '/portal/announcements', element: <ComingSoon title="Announcements" /> },
  { path: '/portal/resources', element: <ComingSoon title="Resources" /> },
  { path: '/portal/my-club', element: <ComingSoon title="My club" /> },
  { path: '/portal/events', element: <ComingSoon title="Events" /> },
  { path: '/portal/showcase/submit', element: <ComingSoon title="Submit to showcase" /> },
  { path: '/portal/showcase/mine', element: <ComingSoon title="My showcase posts" /> },
  { path: '/portal/me', element: <ComingSoon title="Me" /> },
  { path: '/portal/me/profile', element: <ComingSoon title="Profile" /> },
  { path: '/portal/me/settings', element: <ComingSoon title="Settings" /> },
  { path: '/portal/me/contributions', element: <ComingSoon title="Contributions" /> },
  { path: '/portal/me/certificates', element: <ComingSoon title="Certificates" /> },
  { path: '/portal/directory', element: <ComingSoon title="Directory" /> },
  { path: '/portal/feedback', element: <ComingSoon title="Feedback" /> },
];
