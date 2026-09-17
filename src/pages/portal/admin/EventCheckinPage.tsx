import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, Camera, Users, Download, 
  CheckCircle2, AlertTriangle, XCircle, RefreshCw, 
  Search, ShieldCheck, Ticket, UserCheck, ExternalLink,
  Send
} from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { fetchAdminEvents } from '@/lib/events/api';
import { 
  fetchEventCheckins, postEventCheckin, downloadCheckinCsv, 
  fetchEventTicket, dispatchCheckinTickets, type EventTicket, type DispatchResult
} from '@/lib/events/checkinApi';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

function playAudioFeedback(type: 'success' | 'warning' | 'error') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } else if (type === 'warning') {
      [0, 0.12].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.09);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.31);
    }
  } catch {
    // Audio context not available or allowed
  }
}

export function EventCheckinPage() {
  useDocumentMeta({ title: 'Event Check-In Scanner • District 3011' });
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Load events
  const { data: eventsData, isLoading: loadingEvents } = useQuery({
    queryKey: ['events-admin'],
    queryFn: () => fetchAdminEvents({ pageSize: 100 }),
  });

  const events = eventsData?.items ?? [];

  // Filter only upcoming and active events (events started today or in the future)
  const upcomingEvents = useMemo(() => {
    const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12h grace window for today's ongoing events
    return events.filter((e) => new Date(e.startsAt) >= cutoff);
  }, [events]);

  const activeEventsList = upcomingEvents.length > 0 ? upcomingEvents : events;

  // Match active event by ID or slug
  const activeEvent = useMemo(() => {
    if (!activeEventsList.length) return null;
    if (slug) {
      return activeEventsList.find((e) => e.slug === slug || e.id === slug) ?? activeEventsList[0];
    }
    return activeEventsList[0];
  }, [activeEventsList, slug]);

  const eventId = activeEvent?.id;

  // Checkins query
  const { data: checkinData, isLoading: loadingCheckins, refetch: refetchCheckins } = useQuery({
    queryKey: ['event-checkins', eventId],
    queryFn: () => (eventId ? fetchEventCheckins(eventId) : Promise.reject('No event')),
    enabled: Boolean(eventId),
    refetchInterval: 10000,
  });

  const items = checkinData?.items ?? [];
  const byClub = checkinData?.byClub ?? [];

  // Scanner state
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [scanStatus, setScanStatus] = useState<{
    tone: 'idle' | 'success' | 'warning' | 'error';
    title: string;
    description: string;
  }>({
    tone: 'idle',
    title: 'Scanner Active',
    description: 'Aim camera at attendee’s QR ticket or profile badge.',
  });

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScannedTokenRef = useRef<{ token: string; time: number } | null>(null);

  // Manual Check-in Form
  const [walkInName, setWalkInName] = useState('');
  const [walkInClubId, setWalkInClubId] = useState('');

  // Ticket Modal
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketData, setTicketData] = useState<EventTicket | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);

  // Audience Targeting & Automated Dispatch Modal
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchAudience, setDispatchAudience] = useState<
    'all_members' | 'presidents' | 'secretaries' | 'dac_members' | 'custom_emails'
  >('all_members');
  const [customEmailsInput, setCustomEmailsInput] = useState('');
  const [dispatchResult, setDispatchResult] = useState<DispatchResult | null>(null);

  const dispatchMutation = useMutation({
    mutationFn: (payload: {
      audience: 'all_members' | 'presidents' | 'secretaries' | 'dac_members' | 'custom_emails';
      customEmails?: string[];
    }) => dispatchCheckinTickets(eventId!, payload),
    onSuccess: (res) => {
      setDispatchResult(res);
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to dispatch tickets');
    },
  });

  const handleTriggerDispatch = () => {
    let customEmails: string[] | undefined;
    if (dispatchAudience === 'custom_emails') {
      customEmails = customEmailsInput
        .split(/[\n,;]+/)
        .map((s) => s.trim())
        .filter((s) => s.includes('@'));
      if (customEmails.length === 0) {
        alert('Please enter at least one valid email address.');
        return;
      }
    }
    setDispatchResult(null);
    dispatchMutation.mutate({
      audience: dispatchAudience,
      customEmails,
    });
  };

  // Search in table
  const [searchQuery, setSearchQuery] = useState('');

  // Checkin mutation
  const checkinMutation = useMutation({
    mutationFn: (payload: { qrToken?: string; memberId?: string; walkInName?: string; clubId?: string }) =>
      postEventCheckin(eventId!, payload),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ['event-checkins', eventId] });
      const attendee = res.attendeeName || 'Attendee';
      const club = res.clubName ? ` (${res.clubName})` : '';

      if (res.alreadyCheckedIn) {
        playAudioFeedback('warning');
        setScanStatus({
          tone: 'warning',
          title: 'Already Checked In',
          description: `${attendee}${club} was already verified earlier.`,
        });
      } else {
        playAudioFeedback('success');
        setScanStatus({
          tone: 'success',
          title: 'Check-In Confirmed',
          description: `${attendee}${club} verified successfully.`,
        });
      }
    },
    onError: (err: any) => {
      playAudioFeedback('error');
      setScanStatus({
        tone: 'error',
        title: 'Check-In Failed',
        description: err.message || 'Invalid or already scanned QR code.',
      });
    },
  });

  // Handle scanned raw text
  const handleScanText = (text: string) => {
    if (!text || checkinMutation.isPending) return;

    const now = Date.now();
    if (
      lastScannedTokenRef.current &&
      lastScannedTokenRef.current.token === text &&
      now - lastScannedTokenRef.current.time < 3500
    ) {
      return; // Ignore repeated scan within 3.5s
    }

    lastScannedTokenRef.current = { token: text, time: now };
    setScanStatus({
      tone: 'idle',
      title: 'Validating Pass...',
      description: 'Checking cryptographic signature and attendance registry...',
    });

    checkinMutation.mutate({ qrToken: text });
  };

  // Start / Stop Html5Qrcode high-performance camera scanning with permission handling
  useEffect(() => {
    if (activeTab !== 'camera' || !eventId) {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
      return;
    }

    let isMounted = true;
    const scannerId = 'html5-qr-scanner-box';

    async function startScanner() {
      try {
        setCameraError(null);

        // 1. Explicitly prompt / check camera permission
        if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'environment' },
            });
            stream.getTracks().forEach((track) => track.stop());
          } catch (permErr: any) {
            if (!isMounted) return;
            setCameraError(
              permErr?.name === 'NotAllowedError' || permErr?.name === 'PermissionDeniedError'
                ? 'Camera access denied. Please allow camera permissions in your browser settings.'
                : (permErr?.message || 'Unable to access camera.')
            );
            return;
          }
        }

        // 2. Enumerate cameras
        try {
          const videoDevices = await Html5Qrcode.getCameras();
          if (!isMounted) return;
          setDevices(videoDevices as unknown as MediaDeviceInfo[]);

          if (!videoDevices || videoDevices.length === 0) {
            setCameraError('No camera found on this device.');
            return;
          }

          if (!selectedDeviceId) {
            const backCam = videoDevices.find((d) =>
              /back|rear|environment/i.test(d.label),
            );
            setSelectedDeviceId(backCam ? backCam.id : videoDevices[0].id);
          }
        } catch {
          // Continue with default facingMode constraint
        }

        // 3. Stop previous instance if active
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }

        // 4. Initialize Html5Qrcode instance
        const scanner = new Html5Qrcode(scannerId, false);
        html5QrCodeRef.current = scanner;

        const cameraConfig = selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId } }
          : { facingMode: 'environment' };

        await scanner.start(
          cameraConfig,
          {
            fps: 25,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            handleScanText(decodedText);
          },
          () => {
            // Frame decode miss - normal during search
          }
        );
      } catch (err: any) {
        if (!isMounted) return;
        setCameraError(err?.message || 'Unable to start camera. Please verify device permissions.');
      }
    }

    const timer = setTimeout(() => {
      void startScanner();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [activeTab, selectedDeviceId, eventId]);

  // Open ticket pass
  const handleOpenMyTicket = async () => {
    if (!eventId) return;
    setShowTicketModal(true);
    setTicketLoading(true);
    try {
      const ticket = await fetchEventTicket(eventId);
      setTicketData(ticket);
    } catch (err) {
      console.error(err);
    } finally {
      setTicketLoading(false);
    }
  };

  // CSV Export handler
  const [exportingCsv, setExportingCsv] = useState(false);
  const handleExportCsv = async () => {
    if (!eventId || !activeEvent) return;
    setExportingCsv(true);
    try {
      await downloadCheckinCsv(eventId, `checkins-${activeEvent.slug || activeEvent.id}.csv`);
    } catch (err: any) {
      alert(err.message || 'Failed to export CSV');
    } finally {
      setExportingCsv(false);
    }
  };

  // Filtered check-in items for table
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        (item.attendeeName && item.attendeeName.toLowerCase().includes(q)) ||
        (item.clubName && item.clubName.toLowerCase().includes(q)) ||
        item.method.toLowerCase().includes(q),
    );
  }, [items, searchQuery]);

  if (loadingEvents) {
    return (
      <Container>
        <Section eyebrow="Administration" title="Event Check-In">
          <Skeleton shape="rect" className="h-64" />
        </Section>
      </Container>
    );
  }

  if (!activeEvent) {
    return (
      <Container>
        <Section eyebrow="Administration" title="Event Check-In">
          <Card tone="plain" className="p-8 text-center">
            <p className="text-fg-2 font-medium">No active district events found.</p>
            <Button className="mt-4" onClick={() => navigate('/portal/admin/events')}>
              Go to Events Calendar
            </Button>
          </Card>
        </Section>
      </Container>
    );
  }

  return (
    <Container>
      <Section
        eyebrow="Main District Portal"
        title="Event Check-In Dispatch"
        description="Scan cryptographic anti-replay tickets, record walk-ins, and inspect live attendance."
      >
        {/* Event Selector & Actions Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface-2 p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-fg-3">
              Event:
            </label>
            <div className="relative min-w-[240px]">
              <select
                value={activeEvent.id}
                onChange={(e) => {
                  const ev = activeEventsList.find((item) => item.id === e.target.value);
                  if (ev) navigate(`/portal/admin/events/${ev.slug || ev.id}`);
                }}
                className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm font-bold text-fg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {activeEventsList.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({new Date(ev.startsAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDispatchResult(null);
                setShowDispatchModal(true);
              }}
              className="flex items-center gap-1.5"
            >
              <Send className="size-4" />
              Dispatch Tickets
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenMyTicket}
              className="flex items-center gap-1.5"
            >
              <Ticket className="size-4" />
              My Ticket Pass
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCsv}
              disabled={exportingCsv || items.length === 0}
              className="flex items-center gap-1.5"
            >
              <Download className="size-4" />
              {exportingCsv ? 'Exporting…' : 'Export CSV'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => void refetchCheckins()}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={cn('size-4', loadingCheckins && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Live Attendance Stats Header */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card tone="plain" className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <UserCheck className="size-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-fg-3">Total Checked-In</p>
              <h4 className="text-2xl font-black text-fg">{items.length}</h4>
            </div>
          </Card>

          <Card tone="plain" className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-fg-3">Clubs Represented</p>
              <h4 className="text-2xl font-black text-fg">{byClub.length}</h4>
            </div>
          </Card>

          <Card tone="plain" className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-fg-3">Capacity Status</p>
              <h4 className="text-lg font-bold text-fg">
                {activeEvent.capacity ? `${items.length} / ${activeEvent.capacity}` : 'Unlimited'}
              </h4>
            </div>
          </Card>
        </div>

        {/* Main Scanner / Manual Check-In Interface */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Scanner / Manual Entry (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* View Switcher Tabs */}
            <div className="flex rounded-xl border border-line bg-surface-2 p-1">
              <button
                onClick={() => setActiveTab('camera')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all',
                  activeTab === 'camera'
                    ? 'bg-surface shadow-sm text-fg'
                    : 'text-fg-3 hover:text-fg',
                )}
              >
                <Camera className="size-4" />
                Live Camera
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all',
                  activeTab === 'manual'
                    ? 'bg-surface shadow-sm text-fg'
                    : 'text-fg-3 hover:text-fg',
                )}
              >
                <Users className="size-4" />
                Manual Walk-In
              </button>
            </div>

            {activeTab === 'camera' ? (
              <Card tone="plain" className="overflow-hidden p-0">
                <div className="relative aspect-square w-full bg-black overflow-hidden flex items-center justify-center">
                  <div
                    id="html5-qr-scanner-box"
                    className="h-full w-full overflow-hidden flex items-center justify-center [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
                  />

                  {/* Reticle Overlay */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
                    <div className="relative size-56 rounded-2xl border-2 border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                      {/* Corner Accents */}
                      <span className="absolute -left-1 -top-1 size-5 border-l-4 border-t-4 border-accent rounded-tl-md" />
                      <span className="absolute -right-1 -top-1 size-5 border-r-4 border-t-4 border-accent rounded-tr-md" />
                      <span className="absolute -bottom-1 -left-1 size-5 border-b-4 border-l-4 border-accent rounded-bl-md" />
                      <span className="absolute -bottom-1 -right-1 size-5 border-b-4 border-r-4 border-accent rounded-br-md" />
                      
                      {/* Scanning Line Animation */}
                      <div className="absolute inset-x-0 h-0.5 bg-accent shadow-[0_0_8px_#e7004c] animate-pulse top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/85 text-white">
                      <AlertTriangle className="size-10 text-amber-400 mb-2" />
                      <p className="text-sm font-bold">{cameraError}</p>
                      <p className="text-xs text-white/70 mt-1">
                        Please grant camera access or switch to Manual Walk-In mode.
                      </p>
                    </div>
                  )}
                </div>

                {/* Device Selector */}
                {devices.length > 1 && (
                  <div className="border-t border-line bg-surface-2 p-3 flex items-center gap-2">
                    <span className="text-[11px] font-bold text-fg-3">Camera:</span>
                    <select
                      value={selectedDeviceId}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                      className="flex-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-fg"
                    >
                      {devices.map((d, i) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Camera ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Status Result Card */}
                <div
                  className={cn(
                    'p-4 border-t transition-all',
                    scanStatus.tone === 'success' && 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200',
                    scanStatus.tone === 'warning' && 'bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200',
                    scanStatus.tone === 'error' && 'bg-red-500/10 border-red-500/20 text-red-900 dark:text-red-200',
                    scanStatus.tone === 'idle' && 'bg-surface border-line text-fg',
                  )}
                >
                  <div className="flex items-start gap-3">
                    {scanStatus.tone === 'success' && <CheckCircle2 className="size-6 text-emerald-500 shrink-0 mt-0.5" />}
                    {scanStatus.tone === 'warning' && <AlertTriangle className="size-6 text-amber-500 shrink-0 mt-0.5" />}
                    {scanStatus.tone === 'error' && <XCircle className="size-6 text-red-500 shrink-0 mt-0.5" />}
                    {scanStatus.tone === 'idle' && <QrCode className="size-6 text-fg-3 shrink-0 mt-0.5" />}
                    <div className="min-w-0 flex-1">
                      <h5 className="text-sm font-bold leading-tight">{scanStatus.title}</h5>
                      <p className="text-xs opacity-90 mt-1 leading-relaxed">{scanStatus.description}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              /* Manual Walk-In Form */
              <Card tone="plain" className="p-5 flex flex-col gap-4">
                <h4 className="text-sm font-bold text-fg">Manual Attendee Registration</h4>
                <p className="text-xs text-fg-3 -mt-2">
                  Register walk-in attendees or members without digital tickets.
                </p>

                <Field label="Attendee Full Name" required>
                  <Input
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    placeholder="e.g. Rtr. John Doe"
                  />
                </Field>

                <Field label="Club ID / Affiliation" required>
                  <Input
                    value={walkInClubId}
                    onChange={(e) => setWalkInClubId(e.target.value)}
                    placeholder="Enter club ID or select club"
                  />
                </Field>

                <Button
                  onClick={() => {
                    if (!walkInName.trim() || !walkInClubId.trim()) return;
                    checkinMutation.mutate(
                      { walkInName: walkInName.trim(), clubId: walkInClubId.trim() },
                      {
                        onSuccess: () => {
                          setWalkInName('');
                        },
                      },
                    );
                  }}
                  disabled={!walkInName.trim() || !walkInClubId.trim() || checkinMutation.isPending}
                  loading={checkinMutation.isPending}
                >
                  Confirm Walk-In Check-In
                </Button>
              </Card>
            )}

            {/* Club Breakdown Card */}
            <Card tone="plain" className="p-4">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-fg-3 mb-3">
                Attendance By Club ({byClub.length})
              </h5>
              {byClub.length === 0 ? (
                <p className="text-xs text-fg-3 italic">No check-ins recorded yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {byClub.map((c) => (
                    <span
                      key={c.clubId}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1 text-xs font-semibold text-fg"
                    >
                      <span>{c.clubName}</span>
                      <span className="rounded-full bg-accent px-1.5 py-0.2 text-[10px] font-bold text-white">
                        {c.count}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Live Check-In Registry Table (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <Card tone="plain" className="flex flex-col gap-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-extrabold text-fg">Live Attendance Registry</h4>
                  <p className="text-xs text-fg-3 mt-0.5">
                    Chronological verification log for {activeEvent.title}.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-2.5 size-4 text-fg-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search attendee or club…"
                    className="w-full rounded-xl border border-line bg-surface-2 py-1.5 pl-9 pr-3 text-xs font-semibold text-fg placeholder:text-fg-3 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-line bg-surface-2 text-[11px] font-bold uppercase tracking-wider text-fg-3">
                    <tr>
                      <th className="px-4 py-3">Attendee</th>
                      <th className="px-4 py-3">Club</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-fg-3 italic">
                          {searchQuery ? 'No attendees match search query.' : 'No attendees checked in yet.'}
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-surface-2/60 transition-colors">
                          <td className="px-4 py-3 font-bold text-fg">
                            <div className="flex items-center gap-2">
                              {item.member?.photoUrl ? (
                                <img
                                  src={item.member.photoUrl}
                                  alt=""
                                  className="size-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex size-6 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
                                  {(item.attendeeName || 'A')[0]}
                                </div>
                              )}
                              <span>{item.attendeeName || 'Attendee'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-fg-2">
                            {item.clubName || 'District 3011'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge tone={item.method === 'qr' ? 'green' : item.method === 'walk_in' ? 'amber' : 'blue'}>
                              {item.method === 'qr' ? 'QR Scanner' : item.method === 'walk_in' ? 'Walk-In' : 'Manual'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[11px] text-fg-3">
                            {new Date(item.checkedInAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: true,
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        {/* My Ticket / QR Pass Modal */}
        {showTicketModal && (
          <Modal open title="Event Pass & QR Ticket" onClose={() => setShowTicketModal(false)}>
            {ticketLoading ? (
              <div className="p-8 text-center">
                <RefreshCw className="size-8 animate-spin text-accent mx-auto mb-2" />
                <p className="text-xs text-fg-3">Generating cryptographic anti-replay pass…</p>
              </div>
            ) : ticketData ? (
              <div className="flex flex-col items-center text-center gap-4">
                <div className="rounded-2xl border-2 border-line bg-white p-4 shadow-sm">
                  <QRCodeSVG value={ticketData.token} size={220} level="M" />
                </div>

                <div>
                  <h4 className="text-base font-black text-fg">{ticketData.event.title}</h4>
                  <p className="text-xs text-fg-2 font-bold mt-0.5">{ticketData.member.fullName}</p>
                  <p className="text-[11px] text-fg-3">{ticketData.member.clubName}</p>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-1.5 text-[11px] text-fg-3">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  <span>Single-use signed cryptographic pass with anti-replay lock</span>
                </div>

                {ticketData.googleWalletUrl && (
                  <a
                    href={ticketData.googleWalletUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-neutral-800 transition-colors"
                  >
                    <ExternalLink className="size-4" />
                    Save to Google Wallet
                  </a>
                )}
              </div>
            ) : (
              <p className="text-xs text-red-500 text-center py-4">
                Could not generate ticket pass for this event. Please verify your membership profile.
              </p>
            )}
          </Modal>
        )}
        {/* Audience Targeting & Automated Ticket Dispatch Modal */}
        {showDispatchModal && (
          <Modal open title="Dispatch Entry Tickets • Automated Mailer" onClose={() => setShowDispatchModal(false)}>
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs text-fg-3">
                  Targeted members will automatically receive a branded event ticket with a dynamic, cryptographic entry pass via email.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-fg-2">
                  Target Audience
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'all_members', title: 'All Members', desc: 'Every registered active member in District 3011' },
                    { id: 'presidents', title: 'Club Presidents', desc: 'All current active club presidents' },
                    { id: 'secretaries', title: 'Club Secretaries', desc: 'All current active club secretaries' },
                    { id: 'dac_members', title: 'DAC & District Team', desc: 'District council, ZRR, and secretariat officers' },
                    { id: 'custom_emails', title: 'Custom Email Addresses', desc: 'Specific guest or attendee email addresses' },
                  ].map((target) => (
                    <label
                      key={target.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all',
                        dispatchAudience === target.id
                          ? 'border-accent bg-accent/5 ring-1 ring-accent'
                          : 'border-line hover:border-fg-3/40 bg-surface'
                      )}
                    >
                      <input
                        type="radio"
                        name="audience"
                        value={target.id}
                        checked={dispatchAudience === target.id}
                        onChange={() => setDispatchAudience(target.id as any)}
                        className="mt-0.5 text-accent focus:ring-accent"
                      />
                      <div>
                        <div className="text-xs font-bold text-fg">{target.title}</div>
                        <div className="text-[11px] text-fg-3">{target.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {dispatchAudience === 'custom_emails' && (
                <Field
                  label="Email Addresses"
                  hint="Separate multiple emails with commas or new lines"
                  required
                >
                  <textarea
                    rows={3}
                    placeholder="rtr.john@example.com, guest@rotary.org"
                    value={customEmailsInput}
                    onChange={(e) => setCustomEmailsInput(e.target.value)}
                    className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs font-mono text-fg placeholder:text-fg-3 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </Field>
              )}

              {dispatchResult && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    Automated Dispatch Triggered Successfully!
                  </div>
                  <p className="text-[11px]">
                    Queued {dispatchResult.dispatchedCount} dynamic entry tickets for delivery via background email pool.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-line pt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDispatchModal(false)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleTriggerDispatch}
                  disabled={dispatchMutation.isPending}
                  className="flex items-center gap-1.5"
                >
                  <Send className="size-4" />
                  {dispatchMutation.isPending ? 'Queuing…' : 'Send Automated Tickets'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </Section>
    </Container>
  );
}
