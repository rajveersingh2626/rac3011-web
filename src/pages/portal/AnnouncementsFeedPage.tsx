import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { useDocumentMeta } from '@/lib/meta';
import { relativeTimeOrFallback } from '@/lib/format';
import { fetchAnnouncementFeed } from '@/lib/announcements/api';
import type { AnnouncementChannel } from '@/lib/announcements/types';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';

const PAGE_SIZE = 10;

const CHANNEL_LABEL: Record<AnnouncementChannel, string> = {
  portal: 'Portal',
  email: 'Email',
  push: 'Push',
};

export function AnnouncementsFeedPage() {
  useDocumentMeta({ title: 'Announcements' });
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1);

  const query = useQuery({
    queryKey: ['announcements', page],
    queryFn: () => fetchAnnouncementFeed({ page, pageSize: PAGE_SIZE }),
  });

  const setPage = (next: number) => {
    const p = new URLSearchParams(params);
    p.set('page', String(next));
    setParams(p);
  };

  return (
    <Container>
      <Section eyebrow="From the district" title="Announcements" description="Messages sent to you or your role, newest first.">
        {query.isPending ? (
          <div className="flex flex-col gap-3.5">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} shape="rect" className="h-28" />
            ))}
          </div>
        ) : query.isError ? (
          <ErrorState title="Couldn't load announcements" onRetry={() => void query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <EmptyState title="No announcements yet" body="Messages sent to you or your role will show up here." />
        ) : (
          <>
            <div className="flex flex-col gap-3.5">
              {query.data.items.map((a) => (
                <Card key={a.id} title={a.title}>
                  <p className="m-0 whitespace-pre-wrap">{a.body}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[11.5px] text-fg-3">{relativeTimeOrFallback(a.sentAt)}</span>
                    {a.channels.map((c) => (
                      <Badge key={c} tone="neutral">
                        {CHANNEL_LABEL[c]}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
            {query.data.total > query.data.pageSize ? (
              <div className="mt-8">
                <Pagination
                  page={page}
                  totalPages={Math.max(1, Math.ceil(query.data.total / query.data.pageSize))}
                  onChange={setPage}
                  label="Announcement pages"
                />
              </div>
            ) : null}
          </>
        )}
      </Section>
    </Container>
  );
}
