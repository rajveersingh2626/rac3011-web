import { useState, useMemo } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Award, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Send, 
  Info, 
  X, 
  CalendarCheck
} from 'lucide-react';
import type { DistrictClub } from '../../data/districtData';
import { format } from 'date-fns';
import { fetchEvents } from '@/lib/publicApi/events';
import { parseEventStart } from '@/lib/format';
import { drrBookingErrorMessage, postDrrBooking } from '@/lib/publicApi/drrBookings';
import type { BookingPurpose, DrrBookingSubmitResponse } from '@/lib/publicApi/drrBookings';

interface CalendarEntry {
  id: string;
  title: string;
  dateStr: string;
  time: string;
  venue: string | null;
  badge: string;
  description: string;
}

interface DrrRequestForm {
  clubId: string;
  requesterName: string;
  requesterRole: string;
  requesterEmail: string;
  requesterPhone: string;
  purpose: BookingPurpose;
  preferredDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  notes: string;
  // Honeypot: real users never see this field, bots that autofill every input do.
  website: string;
}

const PURPOSE_LABELS: Record<BookingPurpose, string> = {
  installation: 'Club Installation Ceremony',
  club_event: 'Club Event / Flagship Project',
  meeting: 'Official Meeting or Club Visit',
};

export interface DistrictCalendarViewProps {
  isLoggedIn?: boolean;
  /** Accepted by the caller but unused by this view. */
  userRole?: string;
  onOpenLoginModal?: () => void;
  clubs?: DistrictClub[];
}

// Tile accents are presentation only; every tile's content comes from the events API.
const TILE_ACCENTS = ['#D81B60', '#0284C7', '#9333EA', '#EA580C', '#D97706', '#16A34A'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DistrictCalendarView({ isLoggedIn = false, onOpenLoginModal, clubs = [] }: DistrictCalendarViewProps) {
  // Calendar navigation state: default to September 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 = September (0-indexed)

  const [selectedEvent, setSelectedEvent] = useState<CalendarEntry | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  // Value is written but never read in this view; only the setter is kept so the state write is preserved.
  const [, setSelectedDateForRequest] = useState('');

  // Form State for Requesting DRR Presence
  const [formData, setFormData] = useState<DrrRequestForm>({
    clubId: '',
    requesterName: '',
    requesterRole: 'Club President',
    requesterEmail: '',
    requesterPhone: '',
    purpose: 'installation',
    preferredDate: '',
    startTime: '11:00',
    endTime: '14:00',
    venue: '',
    notes: '',
    website: ''
  });

  const [submitted, setSubmitted] = useState<DrrBookingSubmitResponse | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const submitBooking = useMutation({
    mutationFn: postDrrBooking,
    onSuccess: (res) => {
      setFormError(null);
      setSubmitted(res);
    },
    onError: (err) => setFormError(drrBookingErrorMessage(err))
  });

  const selectedClubName = clubs.find((c) => c.id === formData.clubId)?.name ?? '';

  // Live events from PostgreSQL Database via API
  const eventsQuery = useQuery({
    queryKey: ['public', 'events'],
    queryFn: () => fetchEvents(),
    staleTime: 5 * 60 * 1000,
  });

  // The calendar shows only events the API actually publishes. There is no hardcoded
  // baseline list: an unreachable API renders an empty calendar, never invented entries.
  const allEvents = useMemo<CalendarEntry[]>(() => {
    const items = eventsQuery.data?.items ?? [];
    return items.flatMap((ev) => {
      const start = parseEventStart(ev.startsAt);
      if (!start) return [];
      return [{
        id: ev.id,
        title: ev.title,
        dateStr: format(start.date, 'yyyy-MM-dd'),
        // Midnight means the start time is unknown, so the entry shows the date alone.
        time: start.hasTime ? format(start.date, 'h:mm a') : '',
        venue: ev.location || null,
        badge: 'Official Event',
        description: ev.description || '',
      }];
    });
  }, [eventsQuery.data]);

  const signatureTiles = useMemo(() => {
    return [...allEvents]
      .sort((a, b) => a.dateStr.localeCompare(b.dateStr))
      .slice(0, 6)
      .map((ev, idx) => {
        const d = new Date(`${ev.dateStr}T00:00:00`);
        return {
          id: ev.id,
          title: ev.title,
          badge: ev.badge,
          venue: ev.venue,
          monthIndex: d.getMonth(),
          year: d.getFullYear(),
          monthLabel: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
          dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          accentColor: TILE_ACCENTS[idx % TILE_ACCENTS.length],
        };
      });
  }, [allEvents]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleJumpToMonth = (monthIdx: number, yearNum: number) => {
    setCurrentMonth(monthIdx);
    setCurrentYear(yearNum);
  };

  // Build days for the grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Handle open request modal
  const handleOpenRequestModal = (prefillDate: string = '') => {
    if (!isLoggedIn) {
      if (onOpenLoginModal) {
        onOpenLoginModal();
      } else {
        alert('Please log in to your Club Portal account to request an official DRR presence or club visit.');
      }
      return;
    }

    const defaultDateStr = prefillDate || `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`;
    setSelectedDateForRequest(defaultDateStr);
    setFormData((prev) => ({
      ...prev,
      preferredDate: defaultDateStr,
      clubId: prev.clubId || (clubs.length > 0 ? clubs[0].id : '')
    }));
    setFormError(null);
    setSubmitted(null);
    setIsRequestModalOpen(true);
  };

  // Submit DRR presence form
  const handleSubmitBooking = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const startsAt = new Date(`${formData.preferredDate}T${formData.startTime}`);
    const endsAt = new Date(`${formData.preferredDate}T${formData.endTime}`);
    if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
      setFormError('Enter a valid date and time slot.');
      return;
    }
    if (endsAt <= startsAt) {
      setFormError('The end time must be after the start time.');
      return;
    }

    // The API models only purpose/club/requester/slot/notes, so the rest of the form is folded into notes.
    const notes = [
      `Venue: ${formData.venue}`,
      `Requested by: ${formData.requesterName} (${formData.requesterRole})`,
      selectedClubName ? `Host club: ${selectedClubName}` : null,
      formData.notes.trim() ? `Notes: ${formData.notes.trim()}` : null
    ]
      .filter(Boolean)
      .join('\n')
      .slice(0, 2000);

    setFormError(null);
    submitBooking.mutate({
      purpose: formData.purpose,
      clubId: formData.clubId || undefined,
      requesterName: formData.requesterName,
      requesterEmail: formData.requesterEmail,
      requesterPhone: formData.requesterPhone,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      notes,
      website: formData.website || undefined
    });
  };

  return (
    <div style={{ marginTop: '32px', color: '#FFFFFF' }}>

      {/* Header Banner */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        gap: '24px', 
        marginBottom: '32px' 
      }}>
        <div style={{ maxWidth: '820px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span className="pill-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
              <CalendarIcon size={14} /> DISTRICT CALENDAR (RY 2026-27)
            </span>
            <span style={{ 
              backgroundColor: 'rgba(216, 27, 96, 0.25)', 
              color: '#FFB8D2', 
              fontSize: '0.78rem', 
              fontWeight: 800, 
              padding: '4px 12px', 
              borderRadius: '100px',
              border: '1px solid rgba(216, 27, 96, 0.4)'
            }}>
              Official Assemblies &amp; DRR Official Visits
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-1px', lineHeight: 1.15 }}>
            District Milestones &amp; DRR Presence
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.92)', fontSize: '1.02rem', marginTop: '10px', lineHeight: 1.5, fontWeight: 500 }}>
            Explore landmark district assemblies, leadership conclaves, and official club installations. Club leaders can request DRR Archit’s official presence for club milestones directly via the portal.
          </p>
        </div>

        {/* DRR Appointment Request Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
          <button
            onClick={() => handleOpenRequestModal()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--rotaract-pink)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '16px',
              padding: '14px 24px',
              fontSize: '0.96rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(216, 27, 96, 0.45)',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(216, 27, 96, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(216, 27, 96, 0.45)';
            }}
          >
            <CalendarCheck size={20} />
            <span>Request DRR Presence</span>
          </button>

          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={13} /> Requests are filed with the district secretariat for the DRR to review
          </span>
        </div>
      </div>

      {/* 1. UPCOMING EVENTS SQUARE TILES (Top Section) */}
      {signatureTiles.length > 0 && (
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} style={{ color: '#FFD700' }} />
            <span>Signature Upcoming Milestones (RY 2026-27)</span>
          </h3>
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
            Scroll or click tile to view in calendar
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '18px'
        }}>
          {signatureTiles.map((tile) => (
            <div
              key={tile.id}
              onClick={() => handleJumpToMonth(tile.monthIndex, tile.year)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '190px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                borderTop: `5px solid ${tile.accentColor}`,
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ 
                    fontSize: '0.70rem', 
                    fontWeight: 800, 
                    color: tile.accentColor, 
                    backgroundColor: `${tile.accentColor}15`,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    textTransform: 'uppercase'
                  }}>
                    {tile.monthLabel}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 600 }}>
                    {tile.badge}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1F2937', lineHeight: 1.3, margin: 0 }}>
                  {tile.title}
                </h4>
              </div>

              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#111827', fontWeight: 700 }}>
                  <CalendarIcon size={13} style={{ color: tile.accentColor }} />
                  <span>{tile.dateLabel}</span>
                </div>
                {tile.venue && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#6B7280', marginTop: '3px' }}>
                    <MapPin size={13} style={{ color: tile.accentColor }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tile.venue}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* 2. BIG INTERACTIVE MONTHLY CALENDAR */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        color: '#1F2937'
      }}>
        {/* Month Navigation Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={handlePrevMonth}
                aria-label="Previous Month"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#F9FAFB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#374151',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E5E7EB'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleNextMonth}
                aria-label="Next Month"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#F9FAFB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#374151',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E5E7EB'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Quick Jump Buttons for Key Months */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>Key Months:</span>
            {[
              { label: 'Aug \'26', m: 7, y: 2026 },
              { label: 'Sep \'26', m: 8, y: 2026 },
              { label: 'Oct \'26', m: 9, y: 2026 },
              { label: 'Nov \'26', m: 10, y: 2026 },
              { label: 'Dec \'26', m: 11, y: 2026 },
              { label: 'Feb \'27', m: 1, y: 2027 },
              { label: 'Jun \'27', m: 5, y: 2027 }
            ].map((km) => (
              <button
                key={km.label}
                onClick={() => handleJumpToMonth(km.m, km.y)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: currentMonth === km.m && currentYear === km.y ? '1px solid var(--rotaract-pink)' : '1px solid #E5E7EB',
                  backgroundColor: currentMonth === km.m && currentYear === km.y ? 'rgba(216, 27, 96, 0.1)' : '#F9FAFB',
                  color: currentMonth === km.m && currentYear === km.y ? 'var(--rotaract-pink)' : '#4B5563',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {km.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.80rem', fontWeight: 700, color: '#374151' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'var(--rotaract-pink)' }} />
            <span>Signature District Assembly / Conclave</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.80rem', fontWeight: 700, color: '#374151' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#D97706' }} />
            <span>DRR Official Presence (Approved / Confirmed)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.80rem', fontWeight: 700, color: '#374151' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#0284C7' }} />
            <span>District Sports &amp; Exchange Events</span>
          </div>
        </div>

        {/* Weekday Header Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              style={{
                padding: '10px 4px',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: day === 'Sun' ? '#EF4444' : '#4B5563',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days 7-Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px'
        }}>
          {/* Empty cells before 1st of month */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              style={{
                minHeight: '110px',
                backgroundColor: '#F9FAFB',
                borderRadius: '12px',
                opacity: 0.4
              }}
            />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayEvents = allEvents.filter((ev) => ev.dateStr === dateStr);

            return (
              <div
                key={`day-${dayNum}`}
                style={{
                  minHeight: '110px',
                  backgroundColor: dayEvents.length > 0 ? '#FEF2F2' : '#FAFAFA',
                  borderRadius: '12px',
                  border: dayEvents.length > 0 ? '1.5px solid rgba(216, 27, 96, 0.3)' : '1px solid #F3F4F6',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = dayEvents.length > 0 ? '#FEF2F2' : '#FAFAFA';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    color: dayEvents.length > 0 ? 'var(--rotaract-pink)' : '#374151'
                  }}>
                    {dayNum}
                  </span>

                  {/* Plus button to request DRR Presence on this date */}
                  <button
                    onClick={() => handleOpenRequestModal(dateStr)}
                    title={`Request DRR Presence on ${dateStr}`}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      color: '#9CA3AF',
                      padding: '2px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--rotaract-pink)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Event Pills inside Day Cell */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                  {dayEvents.map((ev) => {
                    const isDrr = false;
                    const pillBg = isDrr ? '#FEF3C7' : 'rgba(216, 27, 96, 0.12)';
                    const pillBorder = isDrr ? '#F59E0B' : 'var(--rotaract-pink)';
                    const pillText = isDrr ? '#92400E' : 'var(--rotaract-pink)';

                    return (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        style={{
                          backgroundColor: pillBg,
                          borderLeft: `3px solid ${pillBorder}`,
                          padding: '4px 6px',
                          borderRadius: '4px',
                          fontSize: '0.70rem',
                          fontWeight: 800,
                          color: pillText,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.2
                        }}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    );
                  })}
                </div>

                {dayEvents.length === 0 && (
                  <span style={{ fontSize: '0.68rem', color: '#D1D5DB', alignSelf: 'flex-end' }}>
                    Available
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. EVENT DETAILS MODAL / DRAWER */}
      {selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '560px',
            width: '100%',
            padding: '32px',
            color: '#1F2937',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedEvent(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                border: 'none',
                background: '#F3F4F6',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#4B5563'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{
                backgroundColor: 'rgba(216, 27, 96, 0.12)',
                color: 'var(--rotaract-pink)',
                padding: '4px 12px',
                borderRadius: '100px',
                fontSize: '0.78rem',
                fontWeight: 800
              }}>
                {selectedEvent.badge}
              </span>
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#111827', marginBottom: '16px', lineHeight: 1.25 }}>
              {selectedEvent.title}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', fontSize: '0.88rem', color: '#1E3A8A', fontWeight: 700 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={16} style={{ color: 'var(--rotaract-pink)' }} />
                <span>{selectedEvent.dateStr}</span>
              </div>
              {selectedEvent.time ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} style={{ color: 'var(--rotaract-pink)' }} />
                  <span>{selectedEvent.time}</span>
                </div>
              ) : null}
              {selectedEvent.venue && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} style={{ color: 'var(--rotaract-pink)' }} />
                  <span>{selectedEvent.venue}</span>
                </div>
              )}
            </div>

            <p style={{ fontSize: '0.94rem', color: '#4B5563', lineHeight: 1.6, marginBottom: '20px' }}>
              {selectedEvent.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
              <span style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600 }}>
                District 3011 Official Calendar
              </span>

              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  backgroundColor: 'var(--rotaract-pink)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. REQUEST DRR PRESENCE MODAL (Inside Portal / Authenticated) */}
      {isRequestModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '640px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            color: '#1F2937',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setIsRequestModalOpen(false);
                setSubmitted(null);
                setFormError(null);
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                border: 'none',
                background: '#F3F4F6',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#4B5563'
              }}
            >
              <X size={20} />
            </button>

            {!submitted ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="pill-pink" style={{ fontSize: '0.76rem', padding: '4px 12px' }}>
                    Club Portal Official Service
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 800 }}>
                    ● Authenticated Club Session
                  </span>
                </div>

                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#111827', marginBottom: '6px' }}>
                  Request Official DRR Presence
                </h3>
                <p style={{ fontSize: '0.90rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '24px' }}>
                  Schedule DRR Archit’s official presence for your club installation, landmark community project, or inter-club symposium. The district secretariat is notified straight away, and the DRR confirms or declines the slot.
                </p>

                <form onSubmit={handleSubmitBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {formError ? (
                    <div
                      role="alert"
                      style={{
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#991B1B',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        fontSize: '0.86rem',
                        fontWeight: 600
                      }}
                    >
                      {formError}
                    </div>
                  ) : null}

                  {/* Club Selection */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                      Host Rotaract Club *
                    </label>
                    {clubs.length > 0 ? (
                      <select
                        aria-label="Host Rotaract Club"
                        value={formData.clubId}
                        onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #D1D5DB',
                          fontSize: '0.90rem',
                          backgroundColor: '#FFFFFF',
                          color: '#111827'
                        }}
                      >
                        {clubs.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p style={{ fontSize: '0.86rem', color: '#6B7280', margin: 0 }}>
                        Club list unavailable right now. Your request will still reach the secretariat; name your club in the notes below.
                      </p>
                    )}
                  </div>

                  {/* Requester Name & Role */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                        Requester Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Rtr. Full Name"
                        value={formData.requesterName}
                        onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #D1D5DB',
                          fontSize: '0.90rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                        Designation *
                      </label>
                      <select
                        value={formData.requesterRole}
                        onChange={(e) => setFormData({ ...formData, requesterRole: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #D1D5DB',
                          fontSize: '0.90rem',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        <option value="Club President">Club President</option>
                        <option value="Club Secretary">Club Secretary</option>
                        <option value="Vice President">Vice President</option>
                        <option value="Project Chair">Project Chair</option>
                      </select>
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                        Official Email *
                      </label>
                      <input
                        type="email"
                        placeholder="president@club.org"
                        value={formData.requesterEmail}
                        onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #D1D5DB',
                          fontSize: '0.90rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                        Mobile Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.requesterPhone}
                        onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #D1D5DB',
                          fontSize: '0.90rem'
                        }}
                      />
                    </div>
                  </div>

                  {/* Purpose & Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                        Purpose of DRR Presence *
                      </label>
                      <select
                        aria-label="Purpose of DRR Presence"
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value as BookingPurpose })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #D1D5DB',
                          fontSize: '0.90rem',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        {(Object.keys(PURPOSE_LABELS) as BookingPurpose[]).map((value) => (
                          <option key={value} value={value}>
                            {PURPOSE_LABELS[value]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                        Requested Date *
                      </label>
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #D1D5DB',
                          fontSize: '0.90rem'
                        }}
                      />
                    </div>
                  </div>

                  {/* Timing & Venue */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                          Start *
                        </label>
                        <input
                          type="time"
                          aria-label="Start time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1.5px solid #D1D5DB',
                            fontSize: '0.90rem'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                          End *
                        </label>
                        <input
                          type="time"
                          aria-label="End time"
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1.5px solid #D1D5DB',
                            fontSize: '0.90rem'
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                        Venue / Location *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. India Habitat Centre, Delhi"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #D1D5DB',
                          fontSize: '0.90rem'
                        }}
                      />
                    </div>
                  </div>

                  {/* Attendance & Notes */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                      Special Dignitaries / Notes
                    </label>
                    <textarea
                      placeholder="Mention visiting Rotarians, Rotary Club President, special agenda items or requirements..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #D1D5DB',
                        fontSize: '0.90rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                    className="sr-only"
                    aria-hidden
                  />

                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    marginTop: '12px',
                    paddingTop: '16px',
                    borderTop: '1px solid #E5E7EB'
                  }}>
                    <button
                      type="button"
                      onClick={() => setIsRequestModalOpen(false)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '12px',
                        border: '1px solid #D1D5DB',
                        backgroundColor: '#FFFFFF',
                        color: '#4B5563',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitBooking.isPending}
                      style={{
                        padding: '12px 28px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: 'var(--rotaract-pink)',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: submitBooking.isPending ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 14px rgba(216, 27, 96, 0.4)'
                      }}
                    >
                      <Send size={16} />
                      <span>{submitBooking.isPending ? 'Sending...' : 'Submit Request to DRR Archit'}</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success confirmation state */
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}>
                  <CheckCircle2 size={36} />
                </div>

                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#111827', marginBottom: '8px' }}>
                  Request received
                </h3>
                <p style={{ fontSize: '0.94rem', color: '#4B5563', maxWidth: '480px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
                  {submitted.reference ? (
                    <>
                      Your request is filed under reference <strong style={{ color: 'var(--rotaract-pink)' }}>{submitted.reference}</strong>. Keep it handy to check the status later.
                    </>
                  ) : (
                    <>The district secretariat has your request.</>
                  )}
                </p>

                <div style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: '16px',
                  padding: '18px',
                  textAlign: 'left',
                  marginBottom: '24px',
                  border: '1px solid #E5E7EB'
                }}>
                  {selectedClubName ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>Host Club:</span>
                      <strong style={{ fontSize: '0.84rem', color: '#111827' }}>{selectedClubName}</strong>
                    </div>
                  ) : null}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>Purpose:</span>
                    <strong style={{ fontSize: '0.84rem', color: '#111827' }}>{PURPOSE_LABELS[formData.purpose]}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>Requested Slot:</span>
                    <strong style={{ fontSize: '0.84rem', color: 'var(--rotaract-pink)' }}>{formData.preferredDate}, {formData.startTime} to {formData.endTime}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>Status:</span>
                    <span style={{ fontSize: '0.80rem', color: '#B45309', fontWeight: 800 }}>
                      ● {submitted.status ?? 'requested'}: awaiting DRR decision
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '10px 0 0 0', textAlign: 'left' }}>
                    It appears on the district calendar only once the DRR confirms it.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsRequestModalOpen(false);
                    setSubmitted(null);
                    // Jump calendar to the requested month
                    const [y, m] = formData.preferredDate.split('-').map(Number);
                    if (y && m) {
                      setCurrentYear(y);
                      setCurrentMonth(m - 1);
                    }
                  }}
                  style={{
                    backgroundColor: 'var(--rotaract-pink)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 32px',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(216, 27, 96, 0.4)'
                  }}
                >
                  Back to District Calendar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
