import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Award,
  Users,
  ArrowRight,
  Clock,
  Sparkles,
  FileText,
  Send,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/app/auth';
import { useDocumentMeta } from '@/lib/meta';
import { relativeTimeOrFallback } from '@/lib/format';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { fetchReports } from '@/lib/reports/api';
import type { ReportStatus } from '@/lib/reports/types';
import { currentReportMonth, formatMonthLabel } from '@/lib/reports/month';
import { fetchAnnouncementFeed } from '@/lib/announcements/api';
import { apiFetch } from '@/lib/api';
import { ClubPointsWidget } from './ClubPointsWidget';
import { HostClubApplicationCard } from './components/HostClubApplicationCard';

const STATUS_TONE: Record<ReportStatus, BadgeTone> = {
  draft: 'neutral',
  submitted: 'blue',
  queried: 'amber',
  scored: 'green',
};

const STATUS_LABEL: Record<ReportStatus, string> = {
  draft: 'In progress',
  submitted: 'Submitted',
  queried: 'Needs your reply',
  scored: 'Scored',
};

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function ReportStatusWidget({ clubId }: { clubId: string }) {
  const navigate = useNavigate();
  const month = currentReportMonth();
  const monthLabel = formatMonthLabel(month);
  const query = useQuery({
    queryKey: ['reports', 'draft', clubId, month],
    queryFn: () => fetchReports({ clubId, month, pageSize: 1 }),
  });

  if (query.isPending) return <Skeleton shape="rect" className="h-40" />;
  if (query.isError || !query.data?.items) return null;

  const report = query.data.items[0];

  if (!report) {
    return (
      <Card tone="action" eyebrow={`Due for ${monthLabel}`} title={`${monthLabel} report isn't in yet`}>
        <p className="mb-4 text-sm text-fg-2">
          Add each activity from the month. Most presidents finish in under five minutes.
        </p>
        <Button onClick={() => navigate('/portal/reports/new')}>Start the report</Button>
      </Card>
    );
  }

  const nextHref =
    report.status === 'draft' ? `/portal/reports/${report.id}/review` : `/portal/reports/${report.id}`;

  return (
    <Card eyebrow={monthLabel} title="This month's report">
      <div className="mb-4 flex items-center gap-3">
        <Badge tone={STATUS_TONE[report.status]}>{STATUS_LABEL[report.status]}</Badge>
        {report.status === 'queried' && (
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            District reviewer requested clarification
          </span>
        )}
      </div>
      <Button variant="secondary" onClick={() => navigate(nextHref)}>
        {report.status === 'draft' ? 'Continue the report' : 'View the report'}
      </Button>
    </Card>
  );
}

function AnnouncementsWidget() {
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ['announcements', 'dashboard'],
    queryFn: () => fetchAnnouncementFeed({ page: 1, pageSize: 3 }),
  });

  if (query.isPending) return <Skeleton shape="rect" className="h-40" />;
  if (query.isError || !query.data?.items) return null;

  const items = query.data.items;

  return (
    <Card
      eyebrow="Announcements"
      title="Latest from the district"
      footer={
        <Button variant="secondary" onClick={() => navigate('/portal/announcements')}>
          See all
        </Button>
      }
    >
      {items.length === 0 ? (
        <EmptyState title="No announcements yet" body="Messages sent to you or your role will show up here." />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {items.map((a) => (
            <li key={a.id} className="group rounded-lg p-2 transition-colors hover:bg-surface-2/60">
              <div className="flex items-start justify-between gap-2">
                <p className="m-0 text-sm font-semibold text-fg group-hover:text-accent transition-colors">
                  {a.title}
                </p>
                <span className="shrink-0 text-[11.5px] text-fg-3">
                  {relativeTimeOrFallback(a.sentAt)}
                </span>
              </div>
              {a.body && (
                <p className="m-0 mt-1 line-clamp-1 text-xs text-fg-3">
                  {a.body}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function DashboardPage() {
  useDocumentMeta({ title: 'Dashboard' });
  const navigate = useNavigate();
  const { me, can, formattedRemaining } = useAuth();

  const clubId = me?.profile?.clubId ?? me?.clubs[0]?.id ?? null;
  const clubName = me?.clubs.find((c) => c.id === clubId)?.name ?? (clubId ? 'Club Member' : null);
  const isDistrictOffice = clubId === 'DISTRICT';

  // Strict role capabilities
  const canManageAccess = can('roles:manage');
  const canReviewReports = can('reports:review');
  const canSendAnnouncements = can('announcements:send');
  const canApproveMembers = can('members:approve');
  const canManageEvents = can('events:manage');
  const canReport = Boolean(clubId) && !isDistrictOffice && can('reports:submit', { type: 'club', id: clubId ?? undefined });

  const dashboardAppsQuery = useQuery({
    queryKey: ['dashboard-apps'],
    queryFn: async () => {
      try {
        const res = await apiFetch<{
          hostClubApp?: {
            accessMode: 'all' | 'specific' | 'none';
            allowedClubIds: string[];
          };
        }>('/settings/dashboard-apps');
        return res;
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });

  const hostClubAppConfig = dashboardAppsQuery.data?.hostClubApp;
  const isHostClubAllowed =
    !hostClubAppConfig || hostClubAppConfig.accessMode === 'all'
      ? true
      : hostClubAppConfig.accessMode === 'none'
        ? false
        : Boolean(clubId && hostClubAppConfig.allowedClubIds.includes(clubId));

  const canApplyHostClub =
    canManageAccess ||
    (isHostClubAllowed &&
      (canReport ||
        can('subdomain:ride:host_club_apply') ||
        can('reports:submit') ||
        Boolean(clubId)));
  const canViewPoints = Boolean(clubId) && !isDistrictOffice && can('clubs:view', { type: 'club', id: clubId ?? undefined });
  const isGeneralMember = !canManageAccess && !canReviewReports && !canReport && !canSendAnnouncements;

  const greeting = getTimeGreeting();
  const primaryRoleLabel = canManageAccess
    ? 'Super Admin'
    : canReviewReports
      ? 'District Officer'
      : canReport
        ? 'Club President / Secretary'
        : 'Rotaract Member';

  return (
    <Container>
      <Section
        eyebrow="Overview"
        title={`${greeting}, ${me?.user.name ?? ''}`}
      >
        {/* Dynamic Lively Active Overview Bar */}
        <div className="mb-6 rounded-2xl border border-line-accent/40 bg-gradient-to-r from-surface via-surface-2/40 to-surface p-4 shadow-sm backdrop-blur-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent ring-1 ring-accent/20">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                Active Session
              </span>
              <Badge tone="blue">{primaryRoleLabel}</Badge>
              {clubName && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-fg-2">
                  <Users className="h-3.5 w-3.5 text-fg-3" />
                  {clubName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-fg-3">
              {formattedRemaining && (
                <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-fg-2">
                  <Clock className="h-3.5 w-3.5 text-accent" />
                  Session timeout: {formattedRemaining}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 1. SUPER ADMIN / ROLE CONTROL COMMAND HUB */}
          {canManageAccess && (
            <div className="lg:col-span-2">
              <Card
                eyebrow="Super Admin Command Hub"
                title="Master Access Granter & Role Control"
                rule="accent"
                className="bg-gradient-to-r from-accent/10 via-surface to-accent/5 border-accent/30 shadow-md"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div className="max-w-2xl">
                    <p className="text-sm text-fg leading-relaxed m-0 font-medium">
                      You have full root oversight across all <strong>41 District capabilities</strong>.
                      Grant, inspect, or revoke permissions across all <strong>145+ official leader accounts</strong> (Presidents, Secretaries, Council, ZRR, DRR, and Project Admins).
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <Button
                      variant="primary"
                      onClick={() => navigate('/portal/admin/users')}
                      className="shadow-md shadow-accent/25 font-bold"
                    >
                      Give / Revoke Access
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => navigate('/portal/admin/roles')}
                    >
                      Role Capabilities (41)
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => navigate('/portal/admin/sessions')}
                    >
                      Active Sessions
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/portal/admin/audit')}
                    >
                      Audit Trail
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 2. DISTRICT REVIEWER & OFFICER WORKFLOW QUEUE */}
          {(canReviewReports || canSendAnnouncements || canApproveMembers || canManageEvents) && (
            <div className="lg:col-span-2">
              <Card
                eyebrow="District Operations"
                title="Officer Action Desk"
                rule="accent"
                className="bg-surface border-line-accent shadow-sm"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {canReviewReports && (
                    <div
                      onClick={() => navigate('/portal/admin/clubs')}
                      className="cursor-pointer rounded-xl border border-line-subtle bg-surface-2/40 p-4 transition-all hover:border-accent hover:shadow-sm"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <FileText className="h-5 w-5 text-accent" />
                        <ArrowRight className="h-4 w-4 text-fg-3" />
                      </div>
                      <h4 className="m-0 text-sm font-bold text-fg">Review Reports</h4>
                      <p className="m-0 mt-1 text-xs text-fg-3">Inspect & score club monthly filings</p>
                    </div>
                  )}

                  {canSendAnnouncements && (
                    <div
                      onClick={() => navigate('/portal/admin/announcements')}
                      className="cursor-pointer rounded-xl border border-line-subtle bg-surface-2/40 p-4 transition-all hover:border-accent hover:shadow-sm"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <Send className="h-5 w-5 text-blue-500" />
                        <ArrowRight className="h-4 w-4 text-fg-3" />
                      </div>
                      <h4 className="m-0 text-sm font-bold text-fg">Broadcast Notice</h4>
                      <p className="m-0 mt-1 text-xs text-fg-3">Send messages to district leaders</p>
                    </div>
                  )}

                  {canApproveMembers && (
                    <div
                      onClick={() => navigate('/portal/members')}
                      className="cursor-pointer rounded-xl border border-line-subtle bg-surface-2/40 p-4 transition-all hover:border-accent hover:shadow-sm"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <UserCheck className="h-5 w-5 text-emerald-500" />
                        <ArrowRight className="h-4 w-4 text-fg-3" />
                      </div>
                      <h4 className="m-0 text-sm font-bold text-fg">Member Roster</h4>
                      <p className="m-0 mt-1 text-xs text-fg-3">Approve new memberships</p>
                    </div>
                  )}

                  {canManageEvents && (
                    <div
                      onClick={() => navigate('/portal/admin/events')}
                      className="cursor-pointer rounded-xl border border-line-subtle bg-surface-2/40 p-4 transition-all hover:border-accent hover:shadow-sm"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <Calendar className="h-5 w-5 text-amber-500" />
                        <ArrowRight className="h-4 w-4 text-fg-3" />
                      </div>
                      <h4 className="m-0 text-sm font-bold text-fg">Manage Events</h4>
                      <p className="m-0 mt-1 text-xs text-fg-3">Create and configure district events</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* 3. DELHI MERI JAAN HOST CLUB APPLICATION CALL (FOR RID 3011 PRESIDENTS / SECRETARIES) */}
          {canApplyHostClub && (
            <div className="lg:col-span-2">
              <HostClubApplicationCard />
            </div>
          )}

          {/* 4. CLUB REPORTING & POINTS (FOR CLUB LEADERSHIP) */}
          {canReport && clubId ? (
            <ReportStatusWidget clubId={clubId} />
          ) : !canViewPoints && !canManageAccess ? (
            <EmptyState
              title="No monthly report for this account"
              body="Reporting applies to club presidents and secretaries."
            />
          ) : null}

          {canViewPoints && clubId && <ClubPointsWidget clubId={clubId} />}

          {/* 4. RECENT ANNOUNCEMENTS WIDGET */}
          <AnnouncementsWidget />

          {/* 5. ENGAGEMENT & DRR PRESENCE */}
          <Card eyebrow="District Engagement" title="Request DRR Official Presence">
            <p className="mb-4 text-sm text-fg-2">
              Invite the DRR to your club installation, a landmark community project, or an official
              club visit.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('/calendar')}>Request DRR presence</Button>
              <Button variant="secondary" onClick={() => navigate('/calendar')}>
                View district calendar
              </Button>
            </div>
          </Card>

          {/* 6. GENERAL MEMBER QUICK ACCESS HUB */}
          {isGeneralMember && (
            <div className="lg:col-span-2">
              <Card eyebrow="Member Portal" title="Quick Navigation Hub">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    onClick={() => navigate('/portal/my-club')}
                    className="cursor-pointer rounded-xl border border-line-subtle bg-surface-2/30 p-4 transition-all hover:border-accent"
                  >
                    <Users className="mb-2 h-5 w-5 text-accent" />
                    <h4 className="m-0 text-sm font-bold text-fg">My Club</h4>
                    <p className="m-0 mt-1 text-xs text-fg-3">View your home club details and roster</p>
                  </div>
                  <div
                    onClick={() => navigate('/portal/directory')}
                    className="cursor-pointer rounded-xl border border-line-subtle bg-surface-2/30 p-4 transition-all hover:border-accent"
                  >
                    <Sparkles className="mb-2 h-5 w-5 text-accent" />
                    <h4 className="m-0 text-sm font-bold text-fg">District Directory</h4>
                    <p className="m-0 mt-1 text-xs text-fg-3">Connect with Rotaractors across 3011</p>
                  </div>
                  <div
                    onClick={() => navigate('/portal/showcase/submit')}
                    className="cursor-pointer rounded-xl border border-line-subtle bg-surface-2/30 p-4 transition-all hover:border-accent"
                  >
                    <Award className="mb-2 h-5 w-5 text-accent" />
                    <h4 className="m-0 text-sm font-bold text-fg">Submit Showcase</h4>
                    <p className="m-0 mt-1 text-xs text-fg-3">Feature impactful club initiatives</p>
                  </div>
                  <div
                    onClick={() => navigate('/portal/events')}
                    className="cursor-pointer rounded-xl border border-line-subtle bg-surface-2/30 p-4 transition-all hover:border-accent"
                  >
                    <Calendar className="mb-2 h-5 w-5 text-accent" />
                    <h4 className="m-0 text-sm font-bold text-fg">Events & RSVPs</h4>
                    <p className="m-0 mt-1 text-xs text-fg-3">Browse upcoming district gatherings</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Section>
    </Container>
  );
}
