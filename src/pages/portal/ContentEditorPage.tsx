import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchContentBlocks } from '@/lib/content/api';
import type { ContentBlock } from '@/lib/content/types';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { ContentBlockEditor } from './ContentBlockEditor';

function pageTitle(pageKey: string): string {
  return pageKey.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ContentEditorPage() {
  useDocumentMeta({ title: 'Content' });
  const [openPage, setOpenPage] = useState<string | null>(null);
  const blocksQuery = useQuery({ queryKey: ['content-blocks'], queryFn: () => fetchContentBlocks() });

  const byPage = useMemo(() => {
    const map = new Map<string, ContentBlock[]>();
    for (const block of blocksQuery.data ?? []) {
      const list = map.get(block.pageKey) ?? [];
      list.push(block);
      map.set(block.pageKey, list);
    }
    return map;
  }, [blocksQuery.data]);

  if (blocksQuery.isPending) {
    return (
      <Container width="wide">
        <Skeleton shape="rect" className="h-96" />
      </Container>
    );
  }
  if (blocksQuery.isError) {
    return (
      <Container width="wide">
        <ErrorState title="Couldn't load content" onRetry={() => void blocksQuery.refetch()} />
      </Container>
    );
  }

  const pageKeys = [...byPage.keys()].sort();
  const openBlocks = openPage ? (byPage.get(openPage) ?? []) : [];

  return (
    <Container width="wide">
      <Section
        title="Content"
        description="Publish rights only. You can change what the public sees and nothing else — no club data, no reports, no accounts."
      >
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {pageKeys.map((pageKey) => {
            const blocks = byPage.get(pageKey) ?? [];
            const publishedCount = blocks.filter((b) => b.publishedAt !== null).length;
            return (
              <Card
                key={pageKey}
                tone={openPage === pageKey ? 'action' : 'plain'}
                eyebrow={`${blocks.length} section${blocks.length === 1 ? '' : 's'}`}
                title={pageTitle(pageKey)}
                footer={
                  <Button variant="link" size="sm" onClick={() => setOpenPage(pageKey)}>
                    Edit →
                  </Button>
                }
              >
                {publishedCount} of {blocks.length} published
              </Card>
            );
          })}
        </div>

        {openPage ? (
          <Card className="mt-6" title={pageTitle(openPage)} eyebrow="Sections">
            <div className="mt-2 flex flex-col">
              {openBlocks.map((block) => (
                <ContentBlockEditor key={`${block.pageKey}:${block.sectionKey}`} block={block} />
              ))}
            </div>
          </Card>
        ) : null}
      </Section>
    </Container>
  );
}
