import { useDocumentMeta } from '@/lib/meta';
import { useContentQuery, richTextOf } from '@/lib/publicApi/content';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { RichText } from '@/components/public/RichText';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';

const LEGAL_BODY_CLASS =
  'prose-basic max-w-none text-[15px] leading-[1.75] text-[var(--text-secondary)] [&_a]:font-bold [&_a]:text-[var(--rotaract-pink)] [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-9 [&_h2]:mb-2 [&_h2]:text-[20px] [&_h2]:font-extrabold [&_h2]:tracking-[-0.2px] [&_h2]:text-[var(--text-primary)] [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-[16px] [&_h3]:font-bold [&_h3]:text-[var(--text-primary)] [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1.5';

export function TermsOfServicePage() {
  useDocumentMeta({ title: 'Terms of Service' });
  const { data, isPending, isError, refetch } = useContentQuery('terms-of-service');
  const body = richTextOf(data, 'body');

  return (
    <Container width="narrow">
      <Section align="center" eyebrow="District 3011" title="Terms of Service" className="pb-6" />
      <div className="mx-auto max-w-[72ch] pb-14 md:pb-20">
        {isPending ? (
          <Skeleton lines={6} />
        ) : isError ? (
          <ErrorState title="Couldn't load this page" onRetry={() => void refetch()} />
        ) : body ? (
          <RichText html={body} className={LEGAL_BODY_CLASS} />
        ) : (
          <EmptyState title="This page hasn't been published yet" />
        )}
      </div>
    </Container>
  );
}
