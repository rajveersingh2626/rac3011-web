import type { RouteObject } from 'react-router';
import { ComingSoon } from '@/pages/ComingSoon';

export const portalMemberRouteObjects: RouteObject[] = [
  { path: '/portal/dashboard', element: <ComingSoon title="Dashboard" /> },
];
