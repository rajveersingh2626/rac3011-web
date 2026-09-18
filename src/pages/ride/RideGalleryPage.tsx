import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Tabs } from '@/components/ui/Tabs';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { fetchRideGallery, type PublicGalleryItem } from '@/lib/publicApi/ride';
import { videoEmbedUrl } from '@/lib/ride/video';

const FALLBACK_RIDE_ITEMS: PublicGalleryItem[] = [
  {
    id: 'p1',
    year: 2026,
    caption: 'Kartavya Path Twilight & Tricolor Illumination',
    url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1600&auto=format&fit=crop',
    kind: 'photo',
    order: 1,
  },
  {
    id: 'p2',
    year: 2025,
    caption: 'Morning Sun Through Shahjahanabad Arches',
    url: 'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?q=80&w=1600&auto=format&fit=crop',
    kind: 'photo',
    order: 2,
  },
  {
    id: 'p3',
    year: 2025,
    caption: 'Sizzling Stuffed Paranthas & Clay Tapri Chai',
    url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1600&auto=format&fit=crop',
    kind: 'photo',
    order: 3,
  },
  {
    id: 'p4',
    year: 2024,
    caption: 'Lal Qila Sandstone Poetry & Azure Skies',
    url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1600&auto=format&fit=crop',
    kind: 'photo',
    order: 4,
  },
  {
    id: 'p5',
    year: 2024,
    caption: 'Geometric Shadows Across Mehrauli Columns',
    url: 'https://images.unsplash.com/photo-1545126178-862ad858685c?q=80&w=1600&auto=format&fit=crop',
    kind: 'photo',
    order: 5,
  },
  {
    id: 'p6',
    year: 2024,
    caption: 'Marble Petals Reflected in Ponds - Lotus Temple',
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1600&auto=format&fit=crop',
    kind: 'photo',
    order: 6,
  },
];

function GalleryTile({ item }: { item: PublicGalleryItem }) {
  if (item.kind === 'video') {
    const embed = videoEmbedUrl(item.url);
    return (
      <figure className="w-full">
        {embed ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-page">
            <iframe
              src={embed}
              title={item.caption ?? 'RIDE video'}
              className="absolute inset-0 size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-line bg-page px-4 text-center text-[11.5px] font-semibold text-accent"
          >
            Watch video
          </a>
        )}
        {item.caption ? <figcaption className="pt-1.5 text-[11.5px] text-fg-3">{item.caption}</figcaption> : null}
      </figure>
    );
  }
  return (
    <ImageSlot
      src={item.url}
      alt={item.caption ?? 'RIDE gallery photo'}
      caption={item.caption}
      fallbackSrc="https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1600&auto=format&fit=crop"
    />
  );
}

export function RideGalleryPage() {
  useDocumentMeta({ title: 'Gallery' });
  const query = useQuery({ queryKey: ['public', 'ride', 'gallery'], queryFn: () => fetchRideGallery() });
  const [year, setYear] = useState<string | null>(null);

  if (query.isPending) {
    return (
      <Container width="wide" className="py-10">
        <Skeleton shape="rect" className="h-64" />
      </Container>
    );
  }

  const rawItems = query.data?.items ?? [];
  const rawYears = query.data?.years ?? [];
  const items = query.data ? rawItems : FALLBACK_RIDE_ITEMS;
  const years = query.data && rawYears.length > 0 ? rawYears : [2026, 2025, 2024];

  const activeYear = year ?? String(years[0]);
  const visible = items.filter((i) => String(i.year) === activeYear);

  return (
    <Container width="wide">
      <Section eyebrow="RIDE" title="Gallery" description="Moments with visiting delegations, year by year." align="center">
        <Tabs
          label="Gallery year"
          value={activeYear}
          onChange={setYear}
          tabs={years.map((y) => ({ id: String(y), label: String(y) }))}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <GalleryTile key={item.id} item={item} />
            ))}
          </div>
          {visible.length === 0 ? <EmptyState title="Nothing for this year yet" body="Check back after the next hosted visit." /> : null}
        </Tabs>
      </Section>
    </Container>
  );
}
