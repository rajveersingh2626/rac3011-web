import { Link } from 'react-router';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

// POST /sister-club-requests doesn't exist in the API yet, so this real, auth-gated page has no submit action to wire.
export function SisterClubFormPage() {
  useDocumentMeta({ title: 'Sister club request' });
  return (
    <Container className="py-8" width="narrow">
      <Breadcrumbs items={[{ label: 'Resources', href: '/resources' }, { label: 'Sister club request' }]} linkComponent={Link} />
      <Section align="center" title="Request a sister club" className="pt-6 pb-8" />
      <Card rule="accent" className="mt-6">
        <p className="text-[13.5px] text-fg-2">
          Presidents and secretaries can request an international or domestic sister-club pairing on behalf of their club.
        </p>
        <div className="mt-6">
          <Alert tone="info" title="Not accepting submissions yet">
            Sister club requests open once this feature is live on the district platform. Check back soon, or reach the
            secretariat directly from the <Link to="/contact" className="font-bold text-accent">contact page</Link>.
          </Alert>
        </div>
      </Card>
    </Container>
  );
}
