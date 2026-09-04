import type { RouteObject } from 'react-router';
import { ComingSoon } from '@/pages/ComingSoon';
import { RequirePermission } from './guards';

function guarded(perm: string, path: string, title: string): RouteObject {
  return { element: <RequirePermission perm={perm} />, children: [{ path, element: <ComingSoon title={title} /> }] };
}

export const portalAdminRouteObjects: RouteObject[] = [guarded('reports:review', '/portal/admin/clubs', 'Clubs')];
