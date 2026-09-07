import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  useDocumentMeta({ title: 'Page not found' });
  return (
    <Container>
      <Section
        align="center"
        eyebrow="404"
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={
          <Button onClick={() => (window.location.href = '/')}>Back to home</Button>
        }
      />
    </Container>
  );
}
