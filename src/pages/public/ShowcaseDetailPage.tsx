import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { Award, Calendar } from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { fetchProject, categoryLabelOf } from '@/lib/publicApi/showcase';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { KeyValue } from '@/components/ui/KeyValue';

const HERO_GRADIENT = 'linear-gradient(180deg, #D81B60 0%, #AD1457 100%)';

export function ShowcaseDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ['public', 'projects', slug], queryFn: () => fetchProject(slug) });

  useDocumentMeta({
    title: data?.title ?? 'Showcase project',
    description: data?.summary ?? undefined,
    ogImage: data?.photos[0] ?? undefined,
  });

  if (isPending) {
    return (
      <Container className="py-12" width="narrow">
        <div className="rotaract-card p-7">
          <Skeleton shape="rect" className="h-7 w-3/4 rounded-[10px]" />
          <Skeleton shape="text" lines={3} className="mt-5" />
          <Skeleton shape="rect" className="mt-7 h-56 rounded-[16px]" />
        </div>
      </Container>
    );
  }

  if (isError || !data) {
    return (
      <Container className="py-12" width="narrow">
        <ErrorState title="This project couldn't be found" body="It may have been unpublished." onRetry={() => void refetch()} />
      </Container>
    );
  }

  return (
    <div className="bg-white">
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
        <Container width="narrow" className="py-3">
          <Breadcrumbs items={[{ label: 'Showcase', href: '/showcase' }, { label: data.title ?? 'Project' }]} linkComponent={Link} />
        </Container>
      </div>

      <header style={{ background: HERO_GRADIENT }}>
        <Container width="narrow" className="py-12">
          <div className="section-content-animate">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="pill-pink" style={{ fontSize: '0.78rem' }}>
                {categoryLabelOf(data.category)}
              </span>
              <span className="pill-gold" style={{ fontSize: '0.78rem' }}>
                <Calendar aria-hidden size={13} /> {data.date}
              </span>
            </div>
            <h1 className="m-0 mt-4 text-[clamp(2rem,5vw,3rem)] font-black leading-[1.1] tracking-[-1px] text-white">
              {data.title}
            </h1>
            {data.summary ? (
              <p className="m-0 mt-4 max-w-[62ch] text-[1.05rem] font-medium leading-[1.6] text-[#FCE4EC]">{data.summary}</p>
            ) : null}
          </div>
        </Container>
      </header>

      <Container width="narrow" className="py-11">
        {data.photos.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {data.photos.map((photo, i) => (
              <div key={photo + i} className="overflow-hidden rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.10)] [&_figure>div]:rounded-none">
                <ImageSlot src={photo} alt={`${data.title ?? 'Project'} photo ${i + 1}`} />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-[20px] [&_figure>div]:rounded-none">
            <ImageSlot src={null} alt="Project photo" prompt="No photos published yet" />
          </div>
        )}

        {data.body ? (
          <div className="mt-9 rounded-[16px] border-l-4 border-l-[var(--rotaract-pink)] bg-[#FDF5F8] p-6">
            <div className="whitespace-pre-line text-[0.98rem] leading-[1.7] text-[var(--text-primary)]">{data.body}</div>
          </div>
        ) : null}

        <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rotaract-card p-6">
            <KeyValue
              items={[
                { label: 'Beneficiaries reached', value: data.beneficiaries ?? 'Not reported' },
                { label: 'Published', value: data.publishedAt ? new Date(data.publishedAt).toLocaleDateString('en-IN') : 'Not yet' },
              ]}
            />
          </div>
          <div className="rotaract-card p-6">
            <p className="m-0 mb-3 text-[0.72rem] font-extrabold uppercase tracking-[1px] text-[var(--rotaract-pink)]">Clubs involved</p>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {data.clubs.map(({ role, club }) => (
                <li key={club.id} className="flex items-start gap-2 text-[0.9rem] font-semibold text-[var(--text-primary)]">
                  <Award aria-hidden size={15} className="mt-0.5 shrink-0 text-[#123499]" />
                  <span>
                    {club.slug ? (
                      <Link to={`/showcase/clubs/${club.slug}`} className="font-extrabold text-[var(--rotaract-pink)] hover:underline">
                        {club.name}
                      </Link>
                    ) : (
                      club.name
                    )}{' '}
                    <span className="font-medium text-[var(--text-muted)]">({role})</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
}
