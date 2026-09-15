import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Ban,
  Plus,
  Trash2,
  Info,
  CalendarCheck,
} from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import {
  fetchDrrBookings,
  decideDrrBooking,
  fetchDrrBlocks,
  createDrrBlock,
  deleteDrrBlock,
  type DrrBooking,
  type BookingDecision,
  type BookingStatus,
} from '@/lib/publicApi/drrBookings';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';

export function DrrCalendarAdminPage() {
  useDocumentMeta({ title: 'DRR Calendar & Official Visit Management' });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'bookings' | 'blocks'>('bookings');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Decision Modal State
  const [decisionTarget, setDecisionTarget] = useState<DrrBooking | null>(null);
  const [decisionAction, setDecisionAction] = useState<BookingDecision>('confirmed');
  const [decisionReason, setDecisionReason] = useState<string>('');

  // New Block State
  const [newBlockDate, setNewBlockDate] = useState<string>('');
  const [newBlockReason, setNewBlockReason] = useState<string>('');
  const [blockError, setBlockError] = useState<string | null>(null);

  // Queries
  const bookingsQuery = useQuery({
    queryKey: ['admin-drr-bookings', statusFilter],
    queryFn: () =>
      fetchDrrBookings(statusFilter === 'all' ? {} : { status: statusFilter as BookingStatus }),
  });

  const blocksQuery = useQuery({
    queryKey: ['admin-drr-blocks'],
    queryFn: () => fetchDrrBlocks(),
  });

  // Mutations
  const decideMutation = useMutation({
    mutationFn: ({ id, status, decisionReason }: { id: string; status: BookingDecision; decisionReason?: string }) =>
      decideDrrBooking(id, { status, decisionReason }),
    onSuccess: (_, variables) => {
      const isConfirmed = variables.status === 'confirmed';
      setDecisionTarget(null);
      setDecisionReason('');
      void queryClient.invalidateQueries({ queryKey: ['admin-drr-bookings'] });
      void queryClient.invalidateQueries({ queryKey: ['public', 'drr-calendar'] });
      void queryClient.invalidateQueries({ queryKey: ['public', 'events'] });
      void queryClient.invalidateQueries({ queryKey: ['public'] });
      toast({
        title: isConfirmed ? 'Visit Confirmed & Synced' : 'Visit Request Declined',
        body: isConfirmed
          ? 'The booking has been confirmed, synced to the public calendar & events page, and an email notification was sent.'
          : 'The visit request has been declined, removed from the public calendar & events, and an email notification was sent.',
        tone: isConfirmed ? 'success' : 'info',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Could not update booking',
        body: err?.message || 'An error occurred while updating the visit request.',
        tone: 'error',
      });
    },
  });

  const createBlockMutation = useMutation({
    mutationFn: (input: { date: string; reason?: string }) => createDrrBlock(input),
    onSuccess: () => {
      setNewBlockDate('');
      setNewBlockReason('');
      setBlockError(null);
      void queryClient.invalidateQueries({ queryKey: ['admin-drr-blocks'] });
      void queryClient.invalidateQueries({ queryKey: ['public', 'drr-calendar'] });
      void queryClient.invalidateQueries({ queryKey: ['public'] });
      toast({
        title: 'Date Blocked',
        body: 'The date has been marked unavailable on the public DRR calendar.',
        tone: 'success',
      });
    },
    onError: (err: Error) => {
      setBlockError(err?.message || 'Failed to block date');
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: (id: string) => deleteDrrBlock(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-drr-blocks'] });
      void queryClient.invalidateQueries({ queryKey: ['public', 'drr-calendar'] });
      void queryClient.invalidateQueries({ queryKey: ['public'] });
      toast({
        title: 'Block Removed',
        body: 'The calendar block was removed and the date is open for booking.',
        tone: 'success',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'Failed to remove block',
        body: err?.message || 'An error occurred while deleting the block.',
        tone: 'error',
      });
    },
  });

  const bookings = bookingsQuery.data?.items ?? [];
  const blocks = blocksQuery.data ?? [];

  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const requestedCount = bookings.filter((b) => b.status === 'requested').length;

  return (
    <Container className="py-8" width="default">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-light mb-3">
            <CalendarCheck className="size-3.5" />
            Official Visit Administration
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white m-0">
            DRR Calendar Management
          </h1>
          <p className="mt-1 text-sm text-surface-200">
            Review club visit booking requests, block reserved dates, and regulate the district calendar.
          </p>
        </div>

        {/* Capacity summary pill */}
        <div className="flex items-center gap-3 bg-surface-800/80 border border-surface-700/60 rounded-xl p-3 px-4">
          <Info className="size-5 text-accent-light shrink-0" />
          <div className="text-xs text-surface-200 leading-tight">
            <span className="font-bold text-white block">Visit Capacity: 2 / day</span>
            Dates with 2 confirmed visits or active blocks appear closed to public booking.
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-surface-800/40 border-surface-700/50">
          <div className="text-xs text-surface-300 font-medium">Pending Requests</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{requestedCount}</div>
        </Card>
        <Card className="p-4 bg-surface-800/40 border-surface-700/50">
          <div className="text-xs text-surface-300 font-medium">Confirmed Visits</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{confirmedCount}</div>
        </Card>
        <Card className="p-4 bg-surface-800/40 border-surface-700/50">
          <div className="text-xs text-surface-300 font-medium">Blocked Dates</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{blocks.length}</div>
        </Card>
        <Card className="p-4 bg-surface-800/40 border-surface-700/50">
          <div className="text-xs text-surface-300 font-medium">Total Bookings</div>
          <div className="text-2xl font-black text-white mt-1">{bookings.length}</div>
        </Card>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-3 border-b border-surface-700/60 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'bookings'
              ? 'bg-primary text-white shadow-sm'
              : 'text-surface-300 hover:text-white hover:bg-surface-800/50'
          }`}
        >
          Presence Requests ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('blocks')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'blocks'
              ? 'bg-primary text-white shadow-sm'
              : 'text-surface-300 hover:text-white hover:bg-surface-800/50'
          }`}
        >
          Date Blocks ({blocks.length})
        </button>
      </div>

      {/* TAB 1: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div>
          {/* Status Filter */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-300 font-medium">Filter by Status:</span>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40 text-xs py-1 h-8"
              >
                <option value="all">All Statuses</option>
                <option value="requested">Pending / Requested</option>
                <option value="held">Held</option>
                <option value="confirmed">Confirmed</option>
                <option value="declined">Declined</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          </div>

          {bookingsQuery.isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          ) : bookings.length === 0 ? (
            <EmptyState
              icon={<CalendarIcon className="size-8 text-surface-400" />}
              title="No presence requests found"
              body="Booking requests sent by clubs will be listed here for approval."
            />
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const startDate = new Date(booking.startsAt);
                const endDate = new Date(booking.endsAt);
                const dateStr = startDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const timeStr = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                const statusTone: BadgeTone =
                  booking.status === 'confirmed'
                    ? 'green'
                    : booking.status === 'declined'
                    ? 'red'
                    : booking.status === 'held'
                    ? 'amber'
                    : 'blue';

                return (
                  <Card key={booking.id} className="p-5 bg-surface-800/60 border-surface-700/60 hover:border-surface-600 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge tone={statusTone} className="uppercase text-[10px] tracking-wider font-extrabold">
                            {booking.status}
                          </Badge>
                          <span className="text-xs font-bold text-surface-300">
                            Ref: #{booking.reference}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-surface-700/60 text-surface-200 capitalize">
                            {booking.purpose.replace('_', ' ')}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-black text-white m-0">
                            {booking.requesterName}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-surface-300 mt-1 flex-wrap">
                            <span className="flex items-center gap-1.5 text-accent-light font-semibold">
                              <CalendarIcon className="size-3.5" />
                              {dateStr} ({timeStr})
                            </span>
                            <span>Email: {booking.requesterEmail}</span>
                            <span>Phone: {booking.requesterPhone}</span>
                          </div>
                        </div>

                        {booking.notes && (
                          <p className="text-xs text-surface-200 bg-surface-900/40 p-2.5 rounded-lg border border-surface-700/40 m-0 max-w-2xl">
                            <span className="font-bold text-surface-300">Notes: </span>
                            {booking.notes}
                          </p>
                        )}

                        {booking.decisionReason && (
                          <p className="text-xs text-amber-300/90 italic m-0">
                            Decision note: {booking.decisionReason}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                        {booking.status !== 'confirmed' && (
                          <Button
                            size="sm"
                            variant="primary"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                            onClick={() => {
                              setDecisionTarget(booking);
                              setDecisionAction('confirmed');
                              setDecisionReason('');
                            }}
                          >
                            <CheckCircle className="size-3.5 mr-1" />
                            Confirm
                          </Button>
                        )}
                        {booking.status !== 'declined' && (
                          <Button
                            size="sm"
                            variant="danger"
                            className="font-bold text-xs"
                            onClick={() => {
                              setDecisionTarget(booking);
                              setDecisionAction('declined');
                              setDecisionReason('');
                            }}
                          >
                            <XCircle className="size-3.5 mr-1" />
                            Decline
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BLOCKS & CAPACITY */}
      {activeTab === 'blocks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Block Form */}
          <div className="lg:col-span-1">
            <Card className="p-5 bg-surface-800/60 border-surface-700/60 sticky top-24">
              <div className="flex items-center gap-2 mb-3">
                <Ban className="size-4 text-rose-400" />
                <h3 className="text-base font-bold text-white m-0">Block Calendar Date</h3>
              </div>
              <p className="text-xs text-surface-300 mb-4">
                Mark a day as unavailable on the public DRR calendar (e.g. personal commitments, rotary district meetings).
              </p>

              {blockError && (
                <div className="mb-3 p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {blockError}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newBlockDate) return;
                  createBlockMutation.mutate({ date: newBlockDate, reason: newBlockReason || undefined });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-surface-200 mb-1">
                    Date to Block *
                  </label>
                  <Input
                    type="date"
                    value={newBlockDate}
                    onChange={(e) => setNewBlockDate(e.target.value)}
                    required
                    className="w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-200 mb-1">
                    Reason (Displayed publicly)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Rotary Board Meeting / Official Travel"
                    value={newBlockReason}
                    onChange={(e) => setNewBlockReason(e.target.value)}
                    maxLength={200}
                    className="w-full text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full font-bold text-xs bg-rose-600 hover:bg-rose-500"
                  disabled={!newBlockDate || createBlockMutation.isPending}
                >
                  <Plus className="size-3.5 mr-1" />
                  {createBlockMutation.isPending ? 'Blocking Date...' : 'Block Date'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Active Blocks List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-base font-bold text-white mb-3">
              Currently Blocked Dates ({blocks.length})
            </h3>

            {blocksQuery.isPending ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : blocks.length === 0 ? (
              <EmptyState
                icon={<CalendarIcon className="size-8 text-surface-400" />}
                title="No blocked dates"
                body="Use the form on the left to block dates from the DRR presence calendar."
              />
            ) : (
              blocks.map((block) => (
                <Card
                  key={block.id}
                  className="p-4 bg-surface-800/60 border-surface-700/60 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                      <Ban className="size-5 text-rose-400" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">
                        {(() => {
                          const dateVal = block.date || (block.startsAt ? block.startsAt.split('T')[0] : '');
                          return dateVal
                            ? new Date(`${dateVal}T00:00:00`).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Date unavailable';
                        })()}
                      </div>
                      <div className="text-xs text-surface-300">
                        {block.reason ? block.reason : 'No specific reason given'}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-surface-400 hover:text-rose-400 hover:bg-rose-500/10"
                    onClick={() => deleteBlockMutation.mutate(block.id)}
                    disabled={deleteBlockMutation.isPending}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Decision Reason Modal */}
      {decisionTarget && (
        <Modal
          open={!!decisionTarget}
          onClose={() => setDecisionTarget(null)}
          title={`${decisionAction === 'confirmed' ? 'Confirm' : 'Decline'} DRR Booking`}
        >
          <div className="space-y-4 py-2">
            <p className="text-xs text-surface-200">
              You are about to <strong className="text-white capitalize">{decisionAction}</strong> the visit request for{' '}
              <strong className="text-white">{decisionTarget.requesterName}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-surface-200 mb-1">
                {decisionAction === 'confirmed' ? 'Note for Club (Optional)' : 'Reason for Decline (Optional)'}
              </label>
              <Textarea
                rows={3}
                placeholder={
                  decisionAction === 'confirmed'
                    ? 'e.g. Confirmed for the official installation ceremony. Looking forward to attending!'
                    : 'e.g. Unavailable on requested date / Schedule clash with district conference.'
                }
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDecisionTarget(null)}>
                Cancel
              </Button>
              <Button
                variant={decisionAction === 'confirmed' ? 'primary' : 'danger'}
                size="sm"
                className="font-bold text-xs"
                disabled={decideMutation.isPending}
                onClick={() =>
                  decideMutation.mutate({
                    id: decisionTarget.id,
                    status: decisionAction,
                    decisionReason: decisionReason.trim() || undefined,
                  })
                }
              >
                {decideMutation.isPending
                  ? 'Saving...'
                  : decisionAction === 'confirmed'
                  ? 'Confirm Visit'
                  : 'Decline Visit'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Container>
  );
}
