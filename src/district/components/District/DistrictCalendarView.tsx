import { useState, useEffect, useMemo } from 'react';
import type { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { postEnquiry } from '@/lib/publicApi/enquiries';
import { fetchEvents } from '@/lib/publicApi/events';
import type { PublicEvent } from '@/lib/publicApi/events';

interface CalendarEntry {
  id: string;
  title: string;
  dateStr: string;
  time: string;
  venue: string;
  type: string;
  badge: string;
  organizer: string;
  description: string;
  highlights: string[];
  isCustom?: boolean;
  // Only ever written by toggleBookingStatus on the selected-event copy; never rendered.
  status?: string;
}

interface SignatureTile {
  id: string;
  title: string;
  edition: string;
  month: string;
  date: string;
  venue: string;
  attendees: string;
  accentColor: string;
  icon: string;
}

interface DrrBooking {
  id: string;
  reference: string;
  clubName: string;
  requesterName: string;
  requesterRole: string;
  requesterEmail: string;
  requesterPhone: string;
  purpose: string;
  dateStr: string;
  time: string;
  venue: string;
  expectedAttendance: string;
  notes: string;
  status: string;
  createdAt: string;
}

interface DrrRequestForm {
  clubName: string;
  requesterName: string;
  requesterRole: string;
  requesterEmail: string;
  requesterPhone: string;
  purpose: string;
  preferredDate: string;
  preferredTime: string;
  venue: string;
  expectedAttendance: string;
  notes: string;
}

export interface DistrictCalendarViewProps {
  isLoggedIn?: boolean;
  /** Accepted by the caller but unused by this view. */
  userRole?: string;
  onOpenLoginModal?: () => void;
  clubs?: DistrictClub[];
}

// Baseline District Signature & Official Events with concrete calendar dates
const BASE_CALENDAR_EVENTS: CalendarEntry[] = [
  {
    id: 'cal-install',
    title: 'District Installation 2026 – "Aarambh"',
    dateStr: '2026-08-09',
    time: '10:00 AM – 3:00 PM',
    venue: 'Siri Fort Auditorium, August Kranti Marg, New Delhi',
    type: 'signature',
    badge: 'District Installation',
    organizer: 'Rotaract District Organisation 3011',
    description: 'The monumental commencement of Rotary Year 2026-27 under the leadership of DRR Archit and the District Action Committee. Over 500+ Rotaractors, Rotarians, and youth leaders in attendance.',
    highlights: ['500+ Official Attendees', 'Rotary District Governor Address', 'Charter Presentation & Pins']
  },
  {
    id: 'cal-drr-dh',
    title: 'DRR Official Visit – RAC Delhi Heights',
    dateStr: '2026-08-23',
    time: '4:00 PM – 7:00 PM',
    venue: 'India Habitat Centre, Lodhi Road, New Delhi',
    type: 'drr_visit',
    badge: 'DRR Official Visit',
    organizer: 'Rotaract Club of Delhi Heights',
    description: 'DRR Archit’s official presence at RAC Delhi Heights 15th Installation & Mega Blood Donation Strategy Conclave.',
    highlights: ['Annual Club Audit', 'Installation of Club Board', 'DRR Address & Project Review']
  },
  {
    id: 'cal-drr-nd',
    title: 'DRR Official Visit – RAC New Delhi',
    dateStr: '2026-09-12',
    time: '5:00 PM – 8:00 PM',
    venue: 'PHD House, August Kranti Marg, New Delhi',
    type: 'drr_visit',
    badge: 'DRR Official Visit',
    organizer: 'Rotaract Club of New Delhi',
    description: 'DRR Archit’s official presence for the launch of Project Drishti Phase II and Rotary-Rotaract Joint Assembly.',
    highlights: ['Eye Care Initiative Launch', 'Rotary Sponsor Felicitation', 'Club Growth Review']
  },
  {
    id: 'cal-drr-dc',
    title: 'DRR Official Visit – RAC Delhi Central',
    dateStr: '2026-09-20',
    time: '3:30 PM – 6:30 PM',
    venue: 'Delhi Club Hub, Connaught Place, New Delhi',
    type: 'drr_visit',
    badge: 'DRR Official Visit',
    organizer: 'Rotaract Club of Delhi Central',
    description: 'Official club inspection, community outreach review, and DRR presence for literacy kit distribution.',
    highlights: ['Literacy Project Review', 'New Member Pinning', 'Official DRR Interaction']
  },
  {
    id: 'cal-drr-ggn',
    title: 'DRR Official Visit – RAC Gurgaon',
    dateStr: '2026-10-04',
    time: '11:00 AM – 2:00 PM',
    venue: 'Cyber City Convention Hall, Gurugram',
    type: 'drr_visit',
    badge: 'DRR Official Visit',
    organizer: 'Rotaract Club of Gurgaon',
    description: 'DRR official address at the Corporate Mentorship Bridge symposium and flagship CSR roundtable.',
    highlights: ['Corporate CSR Roundtable', 'Youth Mentorship Placements', 'Zone Prithvi Fellowship']
  },
  {
    id: 'cal-rcl',
    title: 'Rotaract Cricket League (RCL) – Championship',
    dateStr: '2026-10-18',
    time: '8:00 AM – 6:00 PM',
    venue: 'Vasant Kunj Sports Complex, New Delhi',
    type: 'signature',
    badge: 'District Sports',
    organizer: 'Rotaract District Organisation 3011',
    description: 'Marquee inter-club cricket tournament featuring 32+ clubs across Delhi, Gurgaon, and Faridabad competing for the District Championship trophy.',
    highlights: ['32+ Clubs Competing', 'Inter-Zone Fellowship', 'Grand Final & Trophy Presentation']
  },
  {
    id: 'cal-ride',
    title: 'RIDE (Rotaract Inter-District Exchange)',
    dateStr: '2026-11-14',
    time: 'Multi-Day District Immersion',
    venue: 'New Delhi & NCR Heritage Hubs',
    type: 'signature',
    badge: 'Signature Exchange',
    organizer: 'Rotaract District Organisation 3011',
    description: 'Inter-district cultural exchange bringing together visiting Rotaract delegates from across national and international districts for cultural discovery, leadership dialogue, and lasting friendship.',
    highlights: ['National & International Delegates', 'Heritage Walks & Cultural Showcase', 'Rotary-Rotaract Joint Fellowship']
  },
  {
    id: 'cal-ryla',
    title: 'RYLA (Rotary Youth Leadership Awards)',
    dateStr: '2026-12-26',
    time: '3-Day Residential Bootcamp',
    venue: 'Leadership Camp Venue, Delhi NCR Belt',
    type: 'signature',
    badge: 'Youth Leadership Bootcamp',
    organizer: 'Rotaract & Rotary District 3011',
    description: 'The premier youth leadership bootcamp featuring executive mentorship, survival challenges, experiential teamwork activities, and vocational masterclasses.',
    highlights: ['Intensive Leadership Development', 'Executive Mentorship Panels', 'Outdoor Teamwork Challenges']
  },
  {
    id: 'cal-discon',
    title: 'District Conference (DISCON 2027)',
    dateStr: '2027-02-20',
    time: 'Annual Flagship District Convention',
    venue: 'Grand Convention Centre, New Delhi',
    type: 'signature',
    badge: 'Pinnacle Assembly',
    organizer: 'Rotaract District Organisation 3011',
    description: 'The supreme annual convention of Rotaract District 3011, uniting over 1,500+ delegates to celebrate youth achievements, vocational excellence, and visionary keynotes.',
    highlights: ['1,500+ Youth Leaders & Rotarians', 'District Citation & Awards Showcase', 'Celebrity Keynote Speakers & Gala']
  },
  {
    id: 'cal-thanksgiving',
    title: 'District Thanksgiving (Valedictory & Awards)',
    dateStr: '2027-06-20',
    time: 'Annual Valedictory Ceremony',
    venue: 'Auditorium Complex, Delhi NCR',
    type: 'signature',
    badge: 'Year-End Celebration',
    organizer: 'Rotaract District Organisation 3011',
    description: 'The celebratory culmination of Rotary Year 2026-27, recognizing outstanding clubs, presidents, secretaries, and community projects with official district awards.',
    highlights: ['Annual District Awards Distribution', 'DRR Citation Honors', 'Year-Long Humanitarian Celebration']
  }
];

// Square Signature Milestones for top tiles
const SIGNATURE_TILES: SignatureTile[] = [
  {
    id: 'tile-install',
    title: 'District Installation',
    edition: 'Aarambh 2026',
    month: 'August 2026',
    date: 'Aug 9, 2026',
    venue: 'Siri Fort, New Delhi',
    attendees: '500+ Attendees',
    accentColor: '#D81B60',
    icon: 'Sparkles'
  },
  {
    id: 'tile-rcl',
    title: 'Rotaract Cricket League',
    edition: 'RCL Season 2026',
    month: 'October 2026',
    date: 'Oct 18, 2026',
    venue: 'Sports Complex, Delhi',
    attendees: '32+ Clubs Competing',
    accentColor: '#0284C7',
    icon: 'Award'
  },
  {
    id: 'tile-ride',
    title: 'RIDE Immersion',
    edition: 'Inter-District Exchange',
    month: 'November 2026',
    date: 'Nov 14–16, 2026',
    venue: 'Delhi NCR Hubs',
    attendees: 'Pan-India Delegates',
    accentColor: '#9333EA',
    icon: 'MapPin'
  },
  {
    id: 'tile-ryla',
    title: 'RYLA Leadership Camp',
    edition: 'Youth Awards 2026-27',
    month: 'Dec 2026 / Jan 2027',
    date: 'Dec 26–28, 2026',
    venue: 'Residential Camp, NCR',
    attendees: 'Residential Bootcamp',
    accentColor: '#EA580C',
    icon: 'Award'
  },
  {
    id: 'tile-discon',
    title: 'District Conference',
    edition: 'DISCON 2027',
    month: 'Feb / Mar 2027',
    date: 'Feb 20–21, 2027',
    venue: 'Grand Convention Centre',
    attendees: '1,500+ Leaders',
    accentColor: '#D97706',
    icon: 'CalendarIcon'
  },
  {
    id: 'tile-thanks',
    title: 'District Thanksgiving',
    edition: 'Valedictory & Awards',
    month: 'June 2027',
    date: 'Jun 20, 2027',
    venue: 'Delhi NCR',
    attendees: 'Year-End Honors',
    accentColor: '#16A34A',
    icon: 'CheckCircle2'
  }
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DistrictCalendarView({ isLoggedIn = false, onOpenLoginModal, clubs = [] }: DistrictCalendarViewProps) {
  // Calendar navigation state: default to September 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 = September (0-indexed)

  // Local storage synced bookings
  const [customBookings, setCustomBookings] = useState<DrrBooking[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEntry | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  // Value is written but never read in this view; only the setter is kept so the state write is preserved.
  const [, setSelectedDateForRequest] = useState('');

  // Form State for Requesting DRR Presence
  const [formData, setFormData] = useState<DrrRequestForm>({
    clubName: '',
    requesterName: '',
    requesterRole: 'Club President',
    requesterEmail: '',
    requesterPhone: '',
    purpose: 'Installation Ceremony',
    preferredDate: '',
    preferredTime: '11:00 AM',
    venue: '',
    expectedAttendance: '50-100',
    notes: ''
  });

  const [formSubmittedRef, setFormSubmittedRef] = useState<DrrBooking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('drr_presence_bookings_v1');
      const bookings: DrrBooking[] = stored ? JSON.parse(stored) : [];

      // Check if DRR clicked the approval link from email
      const urlParams = new URLSearchParams(window.location.search);
      const approveId = urlParams.get('approve') || (urlParams.get('action') === 'approve' ? urlParams.get('id') : null);
      if (approveId) {
        const found = bookings.find((b) => b.id === approveId);
        if (found) {
          found.status = 'confirmed';
          localStorage.setItem('drr_presence_bookings_v1', JSON.stringify(bookings));
          alert(`Official DRR Presence Request (${approveId}) for ${found.clubName} has been approved and confirmed on the District Calendar!`);
        }
      }

      setCustomBookings(bookings);
    } catch (e) {
      console.warn('Error reading saved bookings:', e);
    }
  }, []);

  // Save custom bookings
  const saveBooking = (newBooking: DrrBooking) => {
    try {
      const updated = [...customBookings, newBooking];
      setCustomBookings(updated);
      localStorage.setItem('drr_presence_bookings_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving booking:', e);
    }
  };

  // Toggle approval of a booking (for DRR / Admin test verification)
  const toggleBookingStatus = (bookingId: string) => {
    try {
      const updated = customBookings.map((b) => {
        if (b.id === bookingId) {
          const newStatus = b.status === 'confirmed' ? 'requested' : 'confirmed';
          return { ...b, status: newStatus };
        }
        return b;
      });
      setCustomBookings(updated);
      localStorage.setItem('drr_presence_bookings_v1', JSON.stringify(updated));
      if (selectedEvent && selectedEvent.id === bookingId) {
        setSelectedEvent((prev) => (prev ? { ...prev, status: prev.status === 'confirmed' ? 'requested' : 'confirmed' } : prev));
      }
    } catch (e) {
      console.warn('Error updating booking status:', e);
    }
  };

  // Live events from PostgreSQL Database via API
  const eventsQuery = useQuery({
    queryKey: ['public', 'events'],
    queryFn: () => fetchEvents(),
    staleTime: 5 * 60 * 1000,
  });

  // Combined events list: dynamically populated from PostgreSQL DB + verified signature milestones + custom approved bookings
  const allEvents = useMemo(() => {
    let baseList = BASE_CALENDAR_EVENTS;
    if (eventsQuery.data?.items && eventsQuery.data.items.length > 0) {
      const dbEvents = eventsQuery.data.items.map((ev) => {
        const local = BASE_CALENDAR_EVENTS.find(
          (b) => b.title.toLowerCase() === ev.title.toLowerCase() || b.id === ev.id
        );
        const dt = new Date(ev.startsAt);
        const dateStr = !isNaN(dt.getTime()) ? dt.toISOString().split('T')[0] : (local?.dateStr || '2026-09-15');
        const timeStr = !isNaN(dt.getTime()) ? dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : (local?.time || '11:00 AM');
        return {
          id: ev.id,
          title: ev.title,
          dateStr: local?.dateStr || dateStr,
          time: local?.time || timeStr,
          venue: ev.location || local?.venue || 'District 3011 Hub, New Delhi',
          type: local?.type || 'official',
          // TODO(port): the public events API/schema has no `isDistrictEvent`, so this always falls through to 'Official Event' (same as the JS source).
          badge: local?.badge || ((ev as PublicEvent & { isDistrictEvent?: boolean }).isDistrictEvent ? 'District Event' : 'Official Event'),
          organizer: local?.organizer || 'Rotaract District Organisation 3011',
          description: ev.description || local?.description || '',
          highlights: local?.highlights || ['Official District Attendance', 'Open for All Rotaractors']
        };
      });

      const existingTitles = new Set(dbEvents.map((e) => e.title.toLowerCase()));
      const extraBase = BASE_CALENDAR_EVENTS.filter((b) => !existingTitles.has(b.title.toLowerCase()));
      baseList = [...dbEvents, ...extraBase];
    }

    const customList = customBookings
      .filter((b) => b.status === 'confirmed')
      .map((b) => ({
        id: b.id,
        title: `DRR Official Visit – ${b.clubName}`,
        dateStr: b.dateStr,
        time: b.time,
        venue: b.venue,
        type: 'drr_visit',
        badge: 'DRR Confirmed Visit',
        organizer: b.clubName,
        description: `Official DRR Archit presence confirmed for ${b.purpose}. Requested by ${b.requesterName} (${b.requesterRole}).`,
        highlights: [
          `Purpose: ${b.purpose}`,
          `Expected Attendees: ${b.expectedAttendance}`,
          `Reference ID: ${b.id}`
        ],
        isCustom: true
      }));

    return [...baseList, ...customList];
  }, [eventsQuery.data, customBookings]);

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
      clubName: prev.clubName || (clubs.length > 0 ? clubs[0].name : 'Rotaract Club of New Delhi')
    }));
    setIsRequestModalOpen(true);
  };

  // Submit DRR presence form
  const handleSubmitBooking = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const refId = `DRR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: DrrBooking = {
      id: refId,
      reference: refId,
      clubName: formData.clubName,
      requesterName: formData.requesterName,
      requesterRole: formData.requesterRole,
      requesterEmail: formData.requesterEmail,
      requesterPhone: formData.requesterPhone,
      purpose: formData.purpose,
      dateStr: formData.preferredDate,
      time: formData.preferredTime,
      venue: formData.venue,
      expectedAttendance: formData.expectedAttendance,
      notes: formData.notes,
      status: 'confirmed', // Automatically confirm in testing so user sees it right on the calendar!
      createdAt: new Date().toISOString()
    };

    saveBooking(newBooking);

    // Format mailto link to trigger email notification to itsdrrarchit@gmail.com
    const emailSubject = encodeURIComponent(`[DRR Presence Request] ${formData.clubName} - ${formData.purpose} (${formData.preferredDate})`);
    const approvalUrl = `${window.location.origin}/calendar?approve=${refId}`;
    const emailBody = encodeURIComponent(
      `Respected DRR Archit,\n\n` +
      `A new official presence request has been submitted on the Rotaract District 3011 Platform.\n\n` +
      `--- REQUEST DETAILS ---\n` +
      `Reference ID: ${refId}\n` +
      `Club: ${formData.clubName}\n` +
      `Requested By: ${formData.requesterName} (${formData.requesterRole})\n` +
      `Contact: ${formData.requesterEmail} | ${formData.requesterPhone}\n` +
      `Purpose: ${formData.purpose}\n` +
      `Date & Time: ${formData.preferredDate} at ${formData.preferredTime}\n` +
      `Venue: ${formData.venue}\n` +
      `Expected Attendance: ${formData.expectedAttendance}\n` +
      `Notes / Dignitaries: ${formData.notes || 'None'}\n\n` +
      `--- APPROVAL LINK ---\n` +
      `To immediately approve & display this appointment on the District Platform, click:\n` +
      `${approvalUrl}\n\n` +
      `Yours in Rotaract,\nDistrict 3011 Secretariat`
    );

    // Sync enquiry to backend database if connected
    postEnquiry({
      kind: 'contact',
      name: formData.requesterName || 'Club Officer',
      email: formData.requesterEmail || 'officer@rotaract3011.org',
      phone: formData.requesterPhone || '',
      organisation: formData.clubName,
      message: `[DRR Presence Request] ${formData.purpose} on ${formData.preferredDate} at ${formData.preferredTime} at ${formData.venue}. Notes: ${formData.notes || 'None'}. Ref: ${refId}`,
      payload: newBooking as unknown as Record<string, unknown>
    }).catch((err) => {
      console.warn('Notice: Booking recorded locally (backend sync notice):', err);
    });

    // Attempt mailto in background
    const mailtoUrl = `mailto:itsdrrarchit@gmail.com?subject=${emailSubject}&body=${emailBody}`;
    try {
      const link = document.createElement('a');
      link.href = mailtoUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      console.log('Mail client prompt triggered.');
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmittedRef(newBooking);
    }, 600);
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
            <Info size={13} /> Official presence notification dispatched to itsdrrarchit@gmail.com
          </span>
        </div>
      </div>

      {/* 1. UPCOMING EVENTS SQUARE TILES (Top Section) */}
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
          {SIGNATURE_TILES.map((tile) => (
            <div
              key={tile.id}
              onClick={() => {
                if (tile.id === 'tile-install') handleJumpToMonth(7, 2026);
                if (tile.id === 'tile-rcl') handleJumpToMonth(9, 2026);
                if (tile.id === 'tile-ride') handleJumpToMonth(10, 2026);
                if (tile.id === 'tile-ryla') handleJumpToMonth(11, 2026);
                if (tile.id === 'tile-discon') handleJumpToMonth(1, 2027);
                if (tile.id === 'tile-thanks') handleJumpToMonth(5, 2027);
              }}
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
                    {tile.month}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 600 }}>
                    {tile.attendees}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1F2937', lineHeight: 1.3, marginBottom: '4px' }}>
                  {tile.title}
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 600, margin: 0 }}>
                  {tile.edition}
                </p>
              </div>

              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#111827', fontWeight: 700 }}>
                  <CalendarIcon size={13} style={{ color: tile.accentColor }} />
                  <span>{tile.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#6B7280', marginTop: '3px' }}>
                  <MapPin size={13} style={{ color: tile.accentColor }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tile.venue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
              { label: 'Nov \'26 (RIDE)', m: 10, y: 2026 },
              { label: 'Dec \'26 (RYLA)', m: 11, y: 2026 },
              { label: 'Feb \'27 (DISCON)', m: 1, y: 2027 },
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
                    const isDrr = ev.type === 'drr_visit';
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
                backgroundColor: selectedEvent.type === 'drr_visit' ? '#FEF3C7' : 'rgba(216, 27, 96, 0.12)',
                color: selectedEvent.type === 'drr_visit' ? '#92400E' : 'var(--rotaract-pink)',
                padding: '4px 12px',
                borderRadius: '100px',
                fontSize: '0.78rem',
                fontWeight: 800
              }}>
                {selectedEvent.badge}
              </span>
              <span style={{ fontSize: '0.80rem', color: '#6B7280', fontWeight: 600 }}>
                {selectedEvent.organizer}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ color: 'var(--rotaract-pink)' }} />
                <span>{selectedEvent.time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} style={{ color: 'var(--rotaract-pink)' }} />
                <span>{selectedEvent.venue}</span>
              </div>
            </div>

            <p style={{ fontSize: '0.94rem', color: '#4B5563', lineHeight: 1.6, marginBottom: '20px' }}>
              {selectedEvent.description}
            </p>

            {selectedEvent.highlights && (
              <div style={{ backgroundColor: '#F9FAFB', borderRadius: '14px', padding: '16px', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--rotaract-pink)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Official Highlights:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedEvent.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#1F2937' }}>
                      <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
              {selectedEvent.isCustom ? (
                <button
                  onClick={() => toggleBookingStatus(selectedEvent.id)}
                  style={{
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    border: '1px solid #D1D5DB',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Toggle DRR Approval State
                </button>
              ) : (
                <span style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600 }}>
                  District 3011 Official Calendar
                </span>
              )}

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
                setFormSubmittedRef(null);
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

            {!formSubmittedRef ? (
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
                  Schedule DRR Archit’s official presence for your club installation, landmark community project, or inter-club symposium. This dispatches an official notification to <strong style={{ color: 'var(--rotaract-pink)' }}>itsdrrarchit@gmail.com</strong>.
                </p>

                <form onSubmit={handleSubmitBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Club Selection */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                      Host Rotaract Club *
                    </label>
                    {clubs.length > 0 ? (
                      <select
                        value={formData.clubName}
                        onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
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
                          <option key={c.id || c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="e.g. Rotaract Club of New Delhi"
                        value={formData.clubName}
                        onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #D1D5DB',
                          fontSize: '0.90rem'
                        }}
                      />
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
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #D1D5DB',
                          fontSize: '0.90rem',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        <option value="Installation Ceremony">Club Installation Ceremony</option>
                        <option value="Official Club Visit (OCV)">Official Club Visit (OCV)</option>
                        <option value="Flagship Community Project">Flagship Community Project Launch</option>
                        <option value="Joint Meeting / Assembly">Joint Inter-Club Assembly</option>
                        <option value="Club Anniversary & Awards">Club Anniversary &amp; Awards</option>
                        <option value="Other Official Meeting">Other Official Meeting</option>
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
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                        Time Slot *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 4:00 PM – 7:00 PM"
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
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
                      disabled={isSubmitting}
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
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 14px rgba(216, 27, 96, 0.4)'
                      }}
                    >
                      <Send size={16} />
                      <span>{isSubmitting ? 'Dispatching...' : 'Submit Request to DRR Archit'}</span>
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
                  Request Dispatched to DRR Archit!
                </h3>
                <p style={{ fontSize: '0.94rem', color: '#4B5563', maxWidth: '480px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
                  Your request has been filed under reference <strong style={{ color: 'var(--rotaract-pink)' }}>{formSubmittedRef.reference}</strong>. A notification summary was prepared for <strong>itsdrrarchit@gmail.com</strong>.
                </p>

                <div style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: '16px',
                  padding: '18px',
                  textAlign: 'left',
                  marginBottom: '24px',
                  border: '1px solid #E5E7EB'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>Host Club:</span>
                    <strong style={{ fontSize: '0.84rem', color: '#111827' }}>{formSubmittedRef.clubName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>Purpose:</span>
                    <strong style={{ fontSize: '0.84rem', color: '#111827' }}>{formSubmittedRef.purpose}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>Confirmed Slot:</span>
                    <strong style={{ fontSize: '0.84rem', color: 'var(--rotaract-pink)' }}>{formSubmittedRef.dateStr} at {formSubmittedRef.time}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>Public Calendar Status:</span>
                    <span style={{ fontSize: '0.80rem', color: '#059669', fontWeight: 800 }}>● Confirmed &amp; Live on Platform</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsRequestModalOpen(false);
                    setFormSubmittedRef(null);
                    // Jump calendar to this booking's month
                    const [y, m] = formSubmittedRef.dateStr.split('-').map(Number);
                    setCurrentYear(y);
                    setCurrentMonth(m - 1);
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
                  View on District Calendar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
