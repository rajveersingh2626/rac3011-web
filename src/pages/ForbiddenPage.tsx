import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';

export function ForbiddenPage() {
  useDocumentMeta({ title: "You don't have access" });
  return (
    <Container>
      <Section
        align="center"
        eyebrow="403"
        title="You don't have access to this page"
        description="If you think this is wrong, contact your club president or the district office."
      />
    </Container>
  );
}
