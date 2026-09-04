import type { ReactElement } from 'react';
import type { RouteObject } from 'react-router';
import { ComingSoon } from '@/pages/ComingSoon';
import { RequirePermission } from './guards';
import { AdminClubsPage } from '@/pages/portal/admin/AdminClubsPage';
import { ReportFormBuilderPage } from '@/pages/portal/admin/ReportFormBuilderPage';
import { AdminRequestsPage } from '@/pages/portal/admin/AdminRequestsPage';
import { NewRequestPage } from '@/pages/portal/admin/NewRequestPage';

function guarded(perm: string, path: string, element: ReactElement): RouteObject {
  return { element: <RequirePermission perm={perm} />, children: [{ path, element }] };
}

export const portalAdminRouteObjects: RouteObject[] = [
  guarded('reports:review', '/portal/admin/clubs', <AdminClubsPage />),
  guarded('reports:score', '/portal/admin/clubs/:clubId/:month', <ComingSoon title="Score month" />),
  guarded('club_facts:edit', '/portal/admin/clubs/:clubId/facts', <ComingSoon title="Club facts" />),
  guarded('point_rules:manage', '/portal/admin/point-rules', <ComingSoon title="Point rules" />),
  guarded('requests:manage', '/portal/admin/report-form', <ReportFormBuilderPage />),
  guarded('requests:manage', '/portal/admin/requests/new', <NewRequestPage />),
  guarded('requests:manage', '/portal/admin/requests', <AdminRequestsPage />),
  guarded('content:edit', '/portal/content', <ComingSoon title="Content" />),
  guarded('roles:manage', '/portal/admin/roles', <ComingSoon title="Roles" />),
  guarded('events:checkin', '/portal/admin/events/:slug', <ComingSoon title="Event check-in" />),
  guarded('members:approve', '/portal/members', <ComingSoon title="Members" />),
  guarded('effort:approve', '/portal/admin/effort-log', <ComingSoon title="Effort log" />),
  guarded('announcements:send', '/portal/admin/announcements', <ComingSoon title="Announcements" />),
  guarded('announcements:send', '/portal/admin/announcements/audience', <ComingSoon title="Announcement audience" />),
  guarded('settings:manage', '/portal/admin/settings', <ComingSoon title="Settings" />),
  guarded('feedback:review', '/portal/admin/feedback', <ComingSoon title="Feedback" />),
  guarded('showcase:publish', '/portal/admin/showcase', <ComingSoon title="Showcase moderation" />),
  guarded('roles:manage', '/portal/admin/users', <ComingSoon title="Users" />),
  guarded('events:manage', '/portal/admin/events', <ComingSoon title="Events" />),
  guarded('public_content:manage', '/portal/admin/public-content/:kind?', <ComingSoon title="Public content" />),
  guarded('audit:view', '/portal/admin/audit', <ComingSoon title="Audit log" />),
];
