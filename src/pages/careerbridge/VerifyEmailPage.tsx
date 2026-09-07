import { useEffect, type ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router';
import { Briefcase } from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { verifyListing } from '@/lib/publicApi/careerbridge';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';

export function VerifyEmailPage() {
  useDocumentMeta({ title: 'Verify your listing' });
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const mutation = useMutation({ mutationFn: () => verifyListing(token) });
  const { mutate } = mutation;

  useEffect(() => {
    if (token) mutate();
  }, [token, mutate]);

  let body: ReactNode;
  if (!token) {
    body = <ErrorState title="Missing verification link" body="This page needs a verification token from your email link." />;
  } else if (mutation.isPending || mutation.isIdle) {
    body = <Skeleton shape="rect" className="h-32" />;
  } else if (mutation.isError) {
    body = (
      <ErrorState
        title="This link is invalid or already used"
        body="Verification links can only be used once. If you posted more than once, check your inbox for the most recent email."
      />
    );
  } else {
    body = (
      <EmptyState
        title="Email verified"
        body="Your listing has been sent to the Career Bridge admins for review. You'll hear back once it's approved."
        action={
          <Link to="/opportunities" className="font-bold text-accent">
            Browse opportunities
          </Link>
        }
      />
    );
  }

  return (
    <Container width="narrow">
      <Section align="center" icon={<Briefcase size={14} />} eyebrow="Career Bridge" title="Verify your listing">
        <Card rule="accent" className="mx-auto max-w-[720px]">
          {body}
        </Card>
      </Section>
    </Container>
  );
}
