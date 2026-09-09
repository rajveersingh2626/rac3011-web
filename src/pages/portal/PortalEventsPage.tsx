import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/auth';
import { useDocumentMeta } from '@/lib/meta';
import { fetchEvents, type PublicEvent, CALENDAR_ICS_PATH } from '@/lib/publicApi/events';
import { fetchAdminEvents, createEvent, deleteEvent, rsvpEvent, type EventAdmin } from '@/lib/events/api';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/cn';

// ---- helpers ----
function formatDateRange(startsAt: string, endsAt: string | null): string {
  const start = new Date(startsAt);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  if (!endsAt) return start.toLocaleDateString('en-IN', opts);
  const end = new Date(endsAt);
  if (start.toDateString() === end.toDateString()) return start.toLocaleDateString('en-IN', opts);
  return `${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-IN', opts)}`;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function isUpcoming(startsAt: string): boolean {
  return new Date(startsAt) >= new Date();
}

function toDateInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

// ---- Event Card ----
function EventCard({ event, canManage }: { event: PublicEvent | EventAdmin; canManage: boolean }) {
  const qc = useQueryClient();
  const deleteMut = useMutation({
    mutationFn: () => deleteEvent(event.id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['events-admin'] });
      void qc.invalidateQueries({ queryKey: ['events-public'] });
    },
  });
  const rsvpMut = useMutation({
    mutationFn: (status: 'going' | 'maybe' | 'not_going') => rsvpEvent(event.id, status),
  });

  const upcoming = isUpcoming(event.startsAt);

  return (
    <Card rule={upcoming ? 'pink' : 'none'} tone="plain" className="flex flex-col gap-2">
      {event.coverUrl && (
        <div className="relative -mx-5 -mt-5 mb-3 overflow-hidden rounded-t-[12px]">
          <img
            src={event.coverUrl}
            alt={event.title}
            className="h-40 w-full object-cover"
            loading="lazy"
          />
          {upcoming && (
            <span className="absolute right-3 top-3 rounded-full bg-[#e7004c] px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
              Upcoming
            </span>
          )}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[11px] font-extrabold uppercase tracking-[1px] text-[#123499]">
            {formatDateRange(event.startsAt, event.endsAt)} · {formatTime(event.startsAt)}
          </p>
          <h3 className="m-0 mt-1 text-[15.5px] font-extrabold text-fg">{event.title}</h3>
          {event.location && (
            <p className="m-0 mt-1 flex items-center gap-1 text-[12.5px] text-fg-3">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              {event.location}
            </p>
          )}
        </div>
        {'isDistrictEvent' in event && event.isDistrictEvent && (
          <Badge tone="blue">District</Badge>
        )}
      </div>

      {event.description && (
        <p className="m-0 line-clamp-3 text-[13px] text-fg-2">{event.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {event.rsvpOpen && upcoming && (
          <div className="flex gap-1.5">
            {(['going', 'maybe', 'not_going'] as const).map((s) => (
              <button
                key={s}
                onClick={() => rsvpMut.mutate(s)}
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors',
                  'border-line text-fg-2 hover:border-accent hover:text-accent',
                )}
              >
                {s === 'going' ? 'Going' : s === 'maybe' ? 'Maybe' : 'Not going'}
              </button>
            ))}
          </div>
        )}
        <a
          href={`/public/calendar.ics`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 rounded-full border border-line px-2.5 py-0.5 text-[11px] font-semibold text-fg-2 no-underline transition-colors hover:border-accent hover:text-accent"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
          </svg>
          Add to calendar
        </a>
        {canManage && (
          <button
            onClick={() => {
              if (confirm(`Delete "${event.title}"?`)) deleteMut.mutate();
            }}
            className="rounded-full border border-red-200 px-2.5 py-0.5 text-[11px] font-semibold text-red-500 transition-colors hover:bg-red-50"
          >
            {deleteMut.isPending ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>
    </Card>
  );
}

// ---- Create Event Modal ----
function CreateEventModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState(toDateInputValue(new Date()));
  const [endsAt, setEndsAt] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isDistrictEvent, setIsDistrictEvent] = useState(true);
  const [rsvpOpen, setRsvpOpen] = useState(false);

  const mut = useMutation({
    mutationFn: () =>
      createEvent({
        title,
        slug: slugify(title),
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        location: location || null,
        description: description || null,
        isDistrictEvent,
        rsvpOpen,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['events-admin'] });
      void qc.invalidateQueries({ queryKey: ['events-public'] });
      onClose();
    },
  });

  return (
    <Modal open title="Create Event" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Field label="Event title" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Club Installation 2025-26" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Starts at" required>
            <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </Field>
          <Field label="Ends at (optional)">
            <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          </Field>
        </div>

        <Field label="Location (optional)">
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Venue name or city" />
        </Field>

        <Field label="Description (optional)">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What's happening at this event?"
          />
        </Field>

        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-[13.5px]">
            <input
              type="checkbox"
              checked={isDistrictEvent}
              onChange={(e) => setIsDistrictEvent(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-accent"
            />
            District event (shows on public calendar)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-[13.5px]">
            <input
              type="checkbox"
              checked={rsvpOpen}
              onChange={(e) => setRsvpOpen(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-accent"
            />
            Allow members to RSVP
          </label>
        </div>

        {mut.isError && (
          <Alert tone="error" title="Failed to create event. Please try again." />
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => mut.mutate()}
            disabled={!title.trim() || !startsAt || mut.isPending}
          >
            {mut.isPending ? 'Creating…' : 'Create event'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ---- Main Page ----
type Tab = 'upcoming' | 'past' | 'all';

export function PortalEventsPage() {
  useDocumentMeta({ title: 'Events Calendar' });
  const { can } = useAuth();
  const canManage = can('events:manage') || can('club_events:log');
  const [tab, setTab] = useState<Tab>('upcoming');
  const [showCreate, setShowCreate] = useState(false);

  const adminQuery = useQuery({
    queryKey: ['events-admin'],
    queryFn: () => fetchAdminEvents({ pageSize: 200 }),
    enabled: canManage,
  });

  const publicQuery = useQuery({
    queryKey: ['events-public'],
    queryFn: () => fetchEvents(),
    enabled: !canManage,
  });

  const events: (PublicEvent | EventAdmin)[] = canManage
    ? (adminQuery.data?.items ?? [])
    : (publicQuery.data?.items ?? []);

  const isPending = canManage ? adminQuery.isPending : publicQuery.isPending;
  const isError = canManage ? adminQuery.isError : publicQuery.isError;
  const refetch = canManage ? adminQuery.refetch : publicQuery.refetch;

  const filtered = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
    if (tab === 'upcoming') return sorted.filter((e) => isUpcoming(e.startsAt));
    if (tab === 'past') return [...sorted.filter((e) => !isUpcoming(e.startsAt))].reverse();
    return sorted;
  }, [events, tab]);

  const upcomingCount = events.filter((e) => isUpcoming(e.startsAt)).length;

  return (
    <Container>
      <Section
        eyebrow="District Calendar"
        title="Events"
        description="Stay up to date with district events, community projects, and installations."
      >
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {/* Tab pills */}
          <div className="flex rounded-full border border-line bg-surface-2 p-0.5">
            {(['upcoming', 'past', 'all'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-[12.5px] font-semibold capitalize transition-all',
                  tab === t ? 'bg-surface shadow-raised text-fg' : 'text-fg-3 hover:text-fg',
                )}
              >
                {t}
                {t === 'upcoming' && upcomingCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-[#e7004c] px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {upcomingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <a
              href={CALENDAR_ICS_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-fg-2 no-underline shadow-raised transition-colors hover:border-accent hover:text-accent"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
              Subscribe (.ics)
            </a>
            {canManage && (
              <Button onClick={() => setShowCreate(true)}>+ Add event</Button>
            )}
          </div>
        </div>

        {isPending ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} shape="rect" className="h-52" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState title="Couldn't load events" onRetry={() => void refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={tab === 'upcoming' ? 'No upcoming events' : 'No events found'}
            body={
              tab === 'upcoming'
                ? canManage
                  ? 'Create the first event for the district calendar using the button above.'
                  : 'Check back soon — events will appear here once scheduled.'
                : 'No events match this filter.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} canManage={canManage} />
            ))}
          </div>
        )}
      </Section>

      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} />}
    </Container>
  );
}
