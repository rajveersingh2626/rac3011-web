import type { RouteObject } from 'react-router';
import { ComingSoon } from '@/pages/ComingSoon';
import { RequirePermission } from './guards';

function guarded(perm: string, path: string, title: string): RouteObject {
  return { element: <RequirePermission perm={perm} />, children: [{ path, element: <ComingSoon title={title} /> }] };
}

export const portalAdminRouteObjects: RouteObject[] = [
  guarded('reports:review', '/portal/admin/clubs', 'Clubs'),
  guarded('reports:score', '/portal/admin/clubs/:clubId/:month', 'Score month'),
  guarded('club_facts:edit', '/portal/admin/clubs/:clubId/facts', 'Club facts'),
  guarded('point_rules:manage', '/portal/admin/point-rules', 'Point rules'),
  guarded('requests:manage', '/portal/admin/report-form', 'Report form builder'),
  guarded('requests:manage', '/portal/admin/requests/new', 'New request'),
  guarded('requests:manage', '/portal/admin/requests', 'Requests'),
  guarded('content:edit', '/portal/content', 'Content'),
  guarded('roles:manage', '/portal/admin/roles', 'Roles'),
  guarded('events:checkin', '/portal/admin/events/:slug', 'Event check-in'),
  guarded('members:approve', '/portal/members', 'Members'),
  guarded('effort:approve', '/portal/admin/effort-log', 'Effort log'),
  guarded('announcements:send', '/portal/admin/announcements', 'Announcements'),
  guarded('announcements:send', '/portal/admin/announcements/audience', 'Announcement audience'),
  guarded('settings:manage', '/portal/admin/settings', 'Settings'),
  guarded('feedback:review', '/portal/admin/feedback', 'Feedback'),
  guarded('showcase:publish', '/portal/admin/showcase', 'Showcase moderation'),
  guarded('roles:manage', '/portal/admin/users', 'Users'),
  guarded('events:manage', '/portal/admin/events', 'Events'),
  guarded('public_content:manage', '/portal/admin/public-content/:kind?', 'Public content'),
  guarded('audit:view', '/portal/admin/audit', 'Audit log'),
];
