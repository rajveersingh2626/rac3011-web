import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { server, mswSetup } from '@/test/msw';
import DistrictCalendarView from './DistrictCalendarView';

mswSetup();

const CONFIRMED_EVENT = {
  id: 'ev1',
  title: 'District Installation',
  slug: 'district-installation',
  startsAt: '2026-08-12T10:00:00.000Z',
  endsAt: null,
  location: 'Bharat Vyapar Mandapam',
  description: 'Installation of the RY 2026-27 district team.',
  coverUrl: null,
  rsvpOpen: false,
  capacity: null,
};

function events(items: unknown[]) {
  return http.get('*/public/events', () => HttpResponse.json({ items }));
}

function renderCalendar() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <DistrictCalendarView />
    </QueryClientProvider>
  );
}

describe('DistrictCalendarView', () => {
  it('renders only what the events API returns', async () => {
    server.use(events([CONFIRMED_EVENT]));
    renderCalendar();
    expect(await screen.findByText('District Installation')).toBeInTheDocument();
    expect(screen.getByText('Bharat Vyapar Mandapam')).toBeInTheDocument();
  });

  it('invents no baseline events when the API returns none', async () => {
    server.use(events([]));
    renderCalendar();
    await screen.findByText(/Requests are filed with the district secretariat/i);
    for (const invented of [/DRR Official Visit –/i, /Rotaract Cricket League/i, /DISCON/i, /RYLA/i, /Thanksgiving/i, /Siri Fort/i]) {
      expect(screen.queryByText(invented)).not.toBeInTheDocument();
    }
  });
});
