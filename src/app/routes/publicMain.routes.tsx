import type { RouteObject } from 'react-router';
import { ComingSoon } from '@/pages/ComingSoon';

export const publicMainRouteObjects: RouteObject[] = [
  { index: true, element: <ComingSoon title="Home" description="Hero, live counter, flagship carousel and showcase teasers." /> },
];
