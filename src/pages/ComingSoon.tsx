import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';

export interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  useDocumentMeta({ title });
  return (
    <Container>
      <Section
        align="center"
        eyebrow="Coming soon"
        title={title}
        description={description ?? `${title} is being built. Check back soon.`}
      />
    </Container>
  );
}
