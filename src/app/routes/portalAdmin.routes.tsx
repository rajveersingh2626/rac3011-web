import { lazy, type ReactElement } from 'react';
import type { RouteObject } from 'react-router';
import { ComingSoon } from '@/pages/ComingSoon';
import { RequirePermission } from './guards';

const AdminClubsPage = lazy(() => import('@/pages/portal/admin/AdminClubsPage').then((m) => ({ default: m.AdminClubsPage })));
const ScoreMonthPage = lazy(() => import('@/pages/portal/admin/ScoreMonthPage').then((m) => ({ default: m.ScoreMonthPage })));
const ClubFactsPage = lazy(() => import('@/pages/portal/admin/ClubFactsPage').then((m) => ({ default: m.ClubFactsPage })));
const PointRulesPage = lazy(() => import('@/pages/portal/admin/PointRulesPage').then((m) => ({ default: m.PointRulesPage })));
const ReportFormBuilderPage = lazy(() =>
  import('@/pages/portal/admin/ReportFormBuilderPage').then((m) => ({ default: m.ReportFormBuilderPage })),
);
const FormBuilderAdminPage = lazy(() =>
  import('@/pages/portal/admin/FormBuilderAdminPage').then((m) => ({ default: m.FormBuilderAdminPage })),
);
const AdminRequestsPage = lazy(() => import('@/pages/portal/admin/AdminRequestsPage').then((m) => ({ default: m.AdminRequestsPage })));
const NewRequestPage = lazy(() => import('@/pages/portal/admin/NewRequestPage').then((m) => ({ default: m.NewRequestPage })));
const AdminMembersPage = lazy(() => import('@/pages/portal/admin/AdminMembersPage').then((m) => ({ default: m.AdminMembersPage })));
const AdminShowcasePage = lazy(() =>
  import('@/pages/portal/admin/AdminShowcasePage').then((m) => ({ default: m.AdminShowcasePage })),
);
const ContentEditorPage = lazy(() =>
  import('@/pages/portal/ContentEditorPage').then((m) => ({ default: m.ContentEditorPage })),
);
const AdminAnnouncementsPage = lazy(() =>
  import('@/pages/portal/admin/AdminAnnouncementsPage').then((m) => ({ default: m.AdminAnnouncementsPage })),
);
const AnnouncementAudiencePage = lazy(() =>
  import('@/pages/portal/admin/AnnouncementAudiencePage').then((m) => ({ default: m.AnnouncementAudiencePage })),
);
const SettingsPage = lazy(() => import('@/pages/portal/admin/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const PublicContentPage = lazy(() =>
  import('@/pages/portal/admin/PublicContentPage').then((m) => ({ default: m.PublicContentPage })),
);
const AdminAuditPage = lazy(() => import('@/pages/portal/admin/AdminAuditPage').then((m) => ({ default: m.AdminAuditPage })));
const AdminRolesPage = lazy(() => import('@/pages/portal/admin/AdminRolesPage').then((m) => ({ default: m.AdminRolesPage })));
const AdminUsersPage = lazy(() => import('@/pages/portal/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const AdminFeedbackPage = lazy(() =>
  import('@/pages/portal/admin/AdminFeedbackPage').then((m) => ({ default: m.AdminFeedbackPage })),
);
const PortalEventsPage = lazy(() =>
  import('@/pages/portal/PortalEventsPage').then((m) => ({ default: m.PortalEventsPage })),
);
const EventCheckinPage = lazy(() =>
  import('@/pages/portal/admin/EventCheckinPage').then((m) => ({ default: m.EventCheckinPage })),
);
const DrrCalendarAdminPage = lazy(() =>
  import('@/pages/portal/admin/DrrCalendarAdminPage').then((m) => ({ default: m.DrrCalendarAdminPage })),
);
const ActiveSessionsPage = lazy(() =>
  import('@/pages/portal/admin/ActiveSessionsPage').then((m) => ({ default: m.ActiveSessionsPage })),
);
const ChangelogPage = lazy(() =>
  import('@/pages/portal/ChangelogPage').then((m) => ({ default: m.ChangelogPage })),
);
const RideAdminPage = lazy(() =>
  import('@/pages/ride/RideAdminPage').then((m) => ({ default: m.RideAdminPage })),
);

function guarded(perm: string, path: string, element: ReactElement): RouteObject {
  return { element: <RequirePermission perm={perm} />, children: [{ path, element }] };
}

export const portalAdminRouteObjects: RouteObject[] = [
  guarded('subdomain:ride:manage,ride:manage,ride:delegates:manage', '/portal/admin/ride', <RideAdminPage />),
  guarded('reports:review', '/portal/admin/clubs', <AdminClubsPage />),
  guarded('reports:score', '/portal/admin/clubs/:clubId/:month', <ScoreMonthPage />),
  guarded('club_facts:edit', '/portal/admin/clubs/:clubId/facts', <ClubFactsPage />),
  guarded('point_rules:manage', '/portal/admin/point-rules', <PointRulesPage />),
  guarded('forms:manage,forms:responses:view,requests:manage,roles:manage', '/portal/admin/form-builder', <FormBuilderAdminPage />),
  guarded('requests:manage', '/portal/admin/report-builder', <ReportFormBuilderPage />),
  guarded('requests:manage', '/portal/admin/report-form', <ReportFormBuilderPage />),
  guarded('requests:manage', '/portal/admin/requests/new', <NewRequestPage />),
  guarded('requests:manage', '/portal/admin/requests', <AdminRequestsPage />),
  guarded('content:edit', '/portal/content', <ContentEditorPage />),
  guarded('roles:manage', '/portal/admin/roles', <AdminRolesPage />),
  guarded('events:checkin', '/portal/admin/checkin', <EventCheckinPage />),
  guarded('events:checkin', '/portal/admin/events/:slug/checkin', <EventCheckinPage />),
  guarded('events:checkin', '/portal/admin/events/:slug', <EventCheckinPage />),
  guarded('members:approve', '/portal/members', <AdminMembersPage />),
  guarded('effort:approve', '/portal/admin/effort-log', <ComingSoon title="Effort log" />),
  guarded('announcements:send', '/portal/admin/announcements', <AdminAnnouncementsPage />),
  guarded('announcements:send', '/portal/admin/announcements/audience', <AnnouncementAudiencePage />),
  guarded('settings:manage', '/portal/admin/settings', <SettingsPage />),
  guarded('feedback:review', '/portal/admin/feedback', <AdminFeedbackPage />),
  guarded('showcase:publish', '/portal/admin/showcase', <AdminShowcasePage />),
  guarded('roles:manage', '/portal/admin/users', <AdminUsersPage />),
  guarded('roles:manage', '/portal/admin/sessions', <ActiveSessionsPage />),
  guarded('events:manage', '/portal/admin/events', <PortalEventsPage />),
  guarded('drr_calendar:manage', '/portal/admin/drr-calendar', <DrrCalendarAdminPage />),
  guarded('public_content:manage', '/portal/admin/public-content/:kind?', <PublicContentPage />),
  guarded('audit:view', '/portal/admin/audit', <AdminAuditPage />),
  guarded('audit:view', '/portal/admin/changelog', <ChangelogPage />),
];
