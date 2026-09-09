import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
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
import { ClubPointsWidget } from './ClubPointsWidget';

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

function ReportStatusWidget({ clubId }: { clubId: string }) {
  const navigate = useNavigate();
  const month = currentReportMonth();
  const monthLabel = formatMonthLabel(month);
  const query = useQuery({
    queryKey: ['reports', 'draft', clubId, month],
    queryFn: () => fetchReports({ clubId, month, pageSize: 1 }),
  });

  if (query.isPending) return <Skeleton shape="rect" className="h-40" />;
  if (query.isError) return null;

  const report = query.data.items[0];

  if (!report) {
    return (
      <Card tone="action" eyebrow={`Due for ${monthLabel}`} title={`${monthLabel} report isn't in yet`}>
        <p className="mb-4">Add each activity from the month. Most presidents finish in under five minutes.</p>
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
  if (query.isError) return null;

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
            <li key={a.id}>
              <p className="m-0 font-semibold text-fg">{a.title}</p>
              <p className="m-0 text-[11.5px] text-fg-3">{relativeTimeOrFallback(a.sentAt)}</p>
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
  const { me, can } = useAuth();
  const clubId = me?.profile?.clubId ?? me?.clubs[0]?.id ?? null;
  const isDistrictOffice = clubId === 'DISTRICT';
  const canManageAccess = can('roles:manage');
  const canReport = Boolean(clubId) && !isDistrictOffice && can('reports:submit', { type: 'club', id: clubId ?? undefined });
  const canViewPoints = Boolean(clubId) && !isDistrictOffice && can('clubs:view', { type: 'club', id: clubId ?? undefined });

  return (
    <Container>
      <Section eyebrow="Overview" title={`Welcome, ${me?.user.name ?? ''}`}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                      You have full root oversight across all <strong>39 District capabilities</strong>.
                      Grant, inspect, or revoke permissions across all <strong>145+ official leader accounts</strong> (Presidents, Secretaries, Council, ZRR, DRR, and Project Admins).
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <Button
                      variant="primary"
                      onClick={() => navigate('/portal/admin/users')}
                      className="shadow-md shadow-accent/25 font-bold"
                    >
                      🛡️ Give / Revoke Access
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => navigate('/portal/admin/roles')}
                    >
                      Role Capabilities (39)
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

          {canReport && clubId ? (
            <ReportStatusWidget clubId={clubId} />
          ) : !canViewPoints && !canManageAccess ? (
            <EmptyState
              title="No monthly report for this account"
              body="Reporting applies to club presidents and secretaries."
            />
          ) : null}

          {canViewPoints && clubId && <ClubPointsWidget clubId={clubId} />}
          <AnnouncementsWidget />

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
        </div>
      </Section>
    </Container>
  );
}
