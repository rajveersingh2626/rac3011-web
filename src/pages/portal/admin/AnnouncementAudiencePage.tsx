import { useState } from 'react';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { AudienceBuilder } from '@/components/announcements/AudienceBuilder';
import type { Audience } from '@/lib/announcements/types';

export function AnnouncementAudiencePage() {
  useDocumentMeta({ title: 'Announcement reach calculator' });
  const [audience, setAudience] = useState<Audience>({});

  return (
    <Container width="narrow">
      <Section
        title="Announcement reach calculator"
        description="Check how many people an audience would reach before composing an announcement."
      >
        <AudienceBuilder value={audience} onChange={setAudience} />
      </Section>
    </Container>
  );
}
