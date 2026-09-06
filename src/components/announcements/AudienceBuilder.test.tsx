import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server, mswSetup } from '@/test/msw';
import { renderPage } from '@/test/render';
import { AudienceBuilder } from './AudienceBuilder';
import type { Audience } from '@/lib/announcements/types';

mswSetup();

const ME = {
  user: { id: 'usr_1', name: 'Rtr. Someone', email: 'someone@example.org', twoFactorEnabled: false },
  profile: { id: 'mp_1', clubId: 'club_dse', status: 'approved' },
  roles: [{ roleKey: 'dsc', scope: { type: 'none' } }],
  grants: { 'announcements:send_all': [{ type: 'none' }] },
  clubs: [],
  theme: 'light',
};

function installHandlers() {
  server.use(
    http.get('/me', () => HttpResponse.json(ME)),
    http.get('/zones', () => HttpResponse.json([])),
    http.get('/public/clubs', () => HttpResponse.json({ items: [], total: 0 })),
    http.post('/announcements/audience/estimate', () => HttpResponse.json({ count: 3 })),
  );
}

function Harness({ onAudience }: { onAudience: (a: Audience) => void }) {
  const [audience, setAudience] = useState<Audience>({});
  return (
    <AudienceBuilder
      value={audience}
      onChange={(next) => {
        setAudience(next);
        onAudience(next);
      }}
    />
  );
}

describe('AudienceBuilder', () => {
  it('dedupes repeated member IDs typed into the member-IDs field', async () => {
    installHandlers();
    const onAudience = vi.fn();
    renderPage(<Harness onAudience={onAudience} />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('mem_abc, mem_def'), 'mem_1, mem_1, mem_2');

    const calls = onAudience.mock.calls;
    const last = calls[calls.length - 1]?.[0] as Audience;
    expect(last.memberIds).toEqual(['mem_1', 'mem_2']);
  });
});
