import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { Calendar } from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { fetchPastDrr, groupTermsLabel } from '@/lib/publicApi/heritage';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { LowResPortrait } from '@/components/public/LowResPortrait';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';

const HERO_GRADIENT = 'linear-gradient(180deg, #D81B60 0%, #AD1457 100%)';

export function DrrProfilePage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ['public', 'past-drrs', slug], queryFn: () => fetchPastDrr(slug) });

  useDocumentMeta({ title: data ? `${data.name} · Heritage` : 'Heritage profile' });

  if (isPending) {
    return (
      <Container className="py-12" width="narrow">
        <div className="rotaract-card flex flex-col gap-5 p-7 sm:flex-row">
          <Skeleton shape="rect" className="h-40 w-40 shrink-0 rounded-[16px]" />
          <div className="flex-1">
            <Skeleton shape="rect" className="h-7 w-2/3 rounded-[10px]" />
            <Skeleton shape="text" lines={4} className="mt-5" />
          </div>
        </div>
      </Container>
    );
  }

  if (isError || !data) {
    return (
      <Container className="py-12" width="narrow">
        <ErrorState title="This profile couldn't be found" onRetry={() => void refetch()} />
      </Container>
    );
  }

  return (
    <div className="bg-white">
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
        <Container width="narrow" className="py-3">
          <Breadcrumbs items={[{ label: 'Heritage', href: '/heritage' }, { label: data.name }]} linkComponent={Link} />
        </Container>
      </div>

      <header style={{ background: HERO_GRADIENT }}>
        <Container width="narrow" className="py-12">
          <div className="section-content-animate flex flex-col items-start gap-7 sm:flex-row sm:items-center">
            <div className="w-[220px] shrink-0 rounded-[20px] bg-white/95 p-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
              {data.isLowResPhoto ? (
                <LowResPortrait src={data.photoUrl} alt={data.name} />
              ) : (
                <ImageSlot ratio="1:1" src={data.photoUrl} alt={data.name} prompt="No photo on file" className="max-w-[200px]" />
              )}
            </div>
            <div className="min-w-0">
              <span className="pill-gold" style={{ fontSize: '0.78rem', padding: '5px 12px' }}>
                <Calendar aria-hidden size={13} /> {groupTermsLabel(data.terms)}
              </span>
              <h1 className="m-0 mt-3 text-[clamp(2rem,5vw,2.75rem)] font-black leading-[1.1] tracking-[-0.5px] text-white">
                {data.name}
              </h1>
            </div>
          </div>
        </Container>
      </header>

      {data.bio ? (
        <Container width="narrow" className="py-11">
          <div className="rotaract-card p-7">
            <p className="m-0 text-[1rem] leading-[1.75] text-[var(--text-secondary)]">{data.bio}</p>
          </div>
        </Container>
      ) : (
        <div className="py-6" />
      )}
    </div>
  );
}
