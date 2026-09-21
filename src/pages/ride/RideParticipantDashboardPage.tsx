import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle2, Clock, AlertCircle, 
  ExternalLink, Copy, Check, 
  Smartphone, Monitor, LogOut, 
  ShieldCheck, Sparkles
} from 'lucide-react';
import { useParticipantAuth } from '@/lib/ride/participantAuth';
import { apiFetch } from '@/lib/api';
import { useDocumentMeta } from '@/lib/meta';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { 
  getStoredForms, getStoredSubmissions, saveStoredSubmission,
  getStoredResources, getStoredRideAnnouncements,
  type FormDefinition, type FormSubmissionRecord,
  type StoredDriveResource, type StoredRideAnnouncement
} from '@/lib/ride/formsStorage';
import { 
  fetchPublicRideResources, 
  fetchPublicRideAnnouncements,
  type RideResource,
  type RideAnnouncement,
} from '@/lib/ride/api';

export function RideParticipantDashboardPage() {
  useDocumentMeta({ title: 'Participant Portal • Delhi Meri Jaan 2026' });
  const { participant, logout } = useParticipantAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const [activeTab, setActiveTab] = useState<'status' | 'forms' | 'resources' | 'inbox' | 'sessions'>('status');
  const [allForms, setAllForms] = useState<FormDefinition[]>(() => getStoredForms());
  const [allSubmissions, setAllSubmissions] = useState<FormSubmissionRecord[]>(() => getStoredSubmissions());
  const [localResources, setLocalResources] = useState<StoredDriveResource[]>(() => getStoredResources());
  const [localAnnouncements, setLocalAnnouncements] = useState<StoredRideAnnouncement[]>(() => getStoredRideAnnouncements());
  
  // Fill Form Modal State
  const [activeFillingForm, setActiveFillingForm] = useState<FormDefinition | null>(null);
  const [formFieldValues, setFormFieldValues] = useState<Record<string, any>>({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [copiedResId, setCopiedResId] = useState<string | null>(null);

  // Sync with storage updates
  useEffect(() => {
    const handleFormsUpdated = () => setAllForms(getStoredForms());
    const handleSubmissionsUpdated = () => setAllSubmissions(getStoredSubmissions());
    const handleResourcesUpdated = () => setLocalResources(getStoredResources());
    const handleAnnouncementsUpdated = () => setLocalAnnouncements(getStoredRideAnnouncements());

    window.addEventListener('ride_forms_updated', handleFormsUpdated);
    window.addEventListener('ride_submissions_updated', handleSubmissionsUpdated);
    window.addEventListener('ride_resources_updated', handleResourcesUpdated);
    window.addEventListener('ride_announcements_updated', handleAnnouncementsUpdated);
    return () => {
      window.removeEventListener('ride_forms_updated', handleFormsUpdated);
      window.removeEventListener('ride_submissions_updated', handleSubmissionsUpdated);
      window.removeEventListener('ride_resources_updated', handleResourcesUpdated);
      window.removeEventListener('ride_announcements_updated', handleAnnouncementsUpdated);
    };
  }, []);

  // Compute pending forms: active forms for which this participant hasn't submitted yet
  const userEmail = participant?.email || '';
  const userName = participant?.fullName || 'Registered Delegate';
  const userDistrict = participant?.homeDistrict || '';
  const userClub = participant?.homeClubName || '';
  const userRef = participant?.id 
    ? `DMJ-${participant.id.slice(0, 6).toUpperCase()}` 
    : 'DMJ-DELEGATE';

  // Server Queries for live resources and announcements with auto-refresh
  const { data: resourcesData } = useQuery({
    queryKey: ['ride', 'publicResources', userEmail, userClub, userDistrict],
    queryFn: () => fetchPublicRideResources({
      email: userEmail || undefined,
      clubName: userClub || undefined,
      district: userDistrict || undefined,
    }),
    refetchInterval: 15000,
  });

  const { data: announcementsData } = useQuery({
    queryKey: ['ride', 'publicAnnouncements', userDistrict, userEmail],
    queryFn: () => fetchPublicRideAnnouncements({
      district: userDistrict || undefined,
      email: userEmail || undefined,
    }),
    refetchInterval: 15000,
  });

  const resources: (RideResource | StoredDriveResource)[] = 
    resourcesData?.items && resourcesData.items.length > 0 
      ? resourcesData.items 
      : localResources;

  // Isolate fallback announcements by recipient email/district or broadcast
  const filteredLocalAnnouncements = localAnnouncements.filter((a) => {
    if (a.targetDistricts && a.targetDistricts.length > 0) {
      if (!userDistrict || !a.targetDistricts.includes(userDistrict)) return false;
    }
    if (a.targetEmails && a.targetEmails.length > 0) {
      if (!userEmail || !a.targetEmails.map((e) => e.toLowerCase()).includes(userEmail.toLowerCase())) return false;
    }
    return true;
  });

  const announcements: (RideAnnouncement | StoredRideAnnouncement)[] = 
    announcementsData?.items && announcementsData.items.length > 0 
      ? announcementsData.items 
      : filteredLocalAnnouncements;

  const userSubmissions = allSubmissions.filter((s) => s.participantEmail.toLowerCase() === userEmail.toLowerCase());
  const submittedFormIds = new Set(userSubmissions.map((s) => s.formId));
  const participantForms = allForms.filter((f) => f.id !== 'form-host-club-app');
  const pendingForms = participantForms.filter((f) => f.isActive && !submittedFormIds.has(f.id));
  const completedForms = participantForms.filter((f) => submittedFormIds.has(f.id));

  const handleOpenForm = (form: FormDefinition) => {
    setActiveFillingForm(form);
    const initial: Record<string, any> = {};
    if (userDistrict) {
      initial['homeDistrict'] = userDistrict;
      initial['rotaryDistrict'] = userDistrict;
    }
    setFormFieldValues(initial);
    setSubmissionSuccess(false);
  };

  const handleFieldChange = (key: string, value: any) => {
    setFormFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmitForm = () => {
    if (!activeFillingForm) return;
    setFormSubmitting(true);

    const finalHomeDistrict = userDistrict || formFieldValues.homeDistrict || '3141';

    setTimeout(() => {
      saveStoredSubmission({
        formId: activeFillingForm.id,
        formTitle: activeFillingForm.title,
        category: 'external_delegation',
        participantName: userName,
        participantEmail: userEmail,
        homeDistrict: finalHomeDistrict,
        status: 'submitted',
        values: {
          ...formFieldValues,
          homeDistrict: finalHomeDistrict,
        },
      });

      // Persist directly to PostgreSQL database via API
      apiFetch('/public/ride/participants', {
        method: 'POST',
        body: {
          fullName: formFieldValues.pocName || formFieldValues.drrName || userName,
          email: formFieldValues.pocEmail || formFieldValues.drrEmail || userEmail,
          phone: formFieldValues.pocPhone || formFieldValues.drrPhone || '+91 99999 99999',
          homeDistrict: finalHomeDistrict,
          homeClubName: formFieldValues.clubName || userClub || 'Rotaract Visiting Club',
          cityState: 'Visiting District Delegation',
          country: 'India',
          edition: 'delhi_meri_jaan_2026',
          arrivalMode: formFieldValues.modeOfArrival || 'Train/Flight',
          allergiesNotes: JSON.stringify(formFieldValues),
        },
      }).catch(() => undefined);

      setAllSubmissions(getStoredSubmissions());
      setFormSubmitting(false);
      setSubmissionSuccess(true);
      setTimeout(() => {
        setActiveFillingForm(null);
        setSubmissionSuccess(false);
      }, 1500);
    }, 600);
  };

  const handleCopyLink = (res: { id: string; driveUrl: string }) => {
    navigator.clipboard.writeText(res.driveUrl);
    setCopiedResId(res.id);
    setTimeout(() => setCopiedResId(null), 2500);
  };

  // Dossier & Registration Verification States
  const hasSubmittedRegistration = 
    userSubmissions.length > 0 || 
    Boolean(participant?.formSubmissions && participant.formSubmissions.length > 0) || 
    Boolean(participant?.dossierData && Object.keys(participant.dossierData).length > 0);

  const rawApproval = (participant?.approvalStatus || '').toLowerCase();
  const rawStatus = (participant?.status || '').toLowerCase();
  const isDistrictApproved = rawApproval === 'approved' || (rawStatus === 'approved' && rawApproval !== 'rejected' && rawApproval !== 'declined');
  const isDistrictRejected = rawApproval === 'rejected' || rawApproval === 'declined' || rawStatus === 'rejected';
  const isDistrictWaitlist = rawApproval === 'waitlist' || rawStatus === 'waitlist';
  const isDistrictUnderReview = rawApproval === 'under_review' || (hasSubmittedRegistration && !isDistrictApproved && !isDistrictRejected);

  const isDelegationConfirmed = isDistrictApproved && (rawStatus === 'confirmed' || participant?.dossierStatus === 'confirmed' || participant?.dossierStatus === 'completed');
  const hasHostClub = Boolean(participant?.hostClub?.name || participant?.hostFamilyName);
  const hostClubName = participant?.hostClub?.name || participant?.hostFamilyName || '';
  const hostClubZone = participant?.hostClub?.zone ? ` (${participant.hostClub.zone})` : '';

  const statusBadgeTone: BadgeTone = 
    isDelegationConfirmed && hasHostClub 
      ? 'green' 
      : isDelegationConfirmed 
        ? 'green' 
        : isDistrictRejected 
          ? 'red' 
          : isDistrictWaitlist 
            ? 'amber' 
            : isDistrictApproved 
              ? 'blue' 
              : hasSubmittedRegistration 
                ? 'blue' 
                : 'neutral';

  const statusBadgeLabel = 
    isDelegationConfirmed && hasHostClub
      ? 'Confirmed & Allocated'
      : isDelegationConfirmed
        ? 'Confirmed Delegate'
        : isDistrictRejected
          ? 'Application Declined'
          : isDistrictWaitlist
            ? 'Waitlist'
            : isDistrictApproved
              ? 'District Approved'
              : hasSubmittedRegistration
                ? 'Under Active Review'
                : 'In Progress';

  const dynamicMilestones = [
    {
      step: '01',
      title: hasSubmittedRegistration ? 'Registration Submitted' : 'Registration Dossier',
      desc: hasSubmittedRegistration
        ? (userDistrict ? `Submitted for RID ${userDistrict} · ${userClub || 'Visiting Delegation'}` : 'Dossier registration submitted to Secretariat')
        : 'Registration form pending submission. Please complete required fields.',
      status: hasSubmittedRegistration ? ('completed' as const) : ('active' as const),
    },
    {
      step: '02',
      title: isDistrictApproved 
        ? 'District Vetted & Approved' 
        : isDistrictRejected 
          ? 'Review Concluded' 
          : isDistrictWaitlist 
            ? 'Waitlisted' 
            : isDistrictUnderReview 
              ? 'Under Active Review' 
              : 'Secretariat Verification',
      desc: isDistrictApproved
        ? 'Official delegation accepted by RID 3011 RIDE Committee'
        : isDistrictRejected
          ? 'Application not accepted for this exchange edition'
          : isDistrictWaitlist
            ? 'Candidate placed on waitlist pending host club allocations'
            : isDistrictUnderReview
              ? 'Application dossier currently being vetted by the Secretariat'
              : 'Queue assigned for RID 3011 Exchange Secretariat review',
      status: isDistrictApproved 
        ? ('completed' as const) 
        : isDistrictRejected 
          ? ('rejected' as const) 
          : isDistrictUnderReview || isDistrictWaitlist 
            ? ('active' as const) 
            : ('pending' as const),
    },
    {
      step: '03',
      title: isDelegationConfirmed 
        ? 'Delegation Confirmed' 
        : isDistrictRejected 
          ? 'Exchange Seat Closed' 
          : isDistrictWaitlist 
            ? 'Waitlist Pool' 
            : 'Seat Allocation',
      desc: isDelegationConfirmed
        ? 'Exchange seat guaranteed for Delhi Meri Jaan 2026'
        : isDistrictRejected
          ? 'Seat allocation closed'
          : isDistrictWaitlist
            ? 'Awaiting capacity opening in subsequent rounds'
            : isDistrictApproved
              ? 'Awaiting final seat confirmation from Exchange Secretariat'
              : 'Seat allocation will unlock upon approval',
      status: isDelegationConfirmed 
        ? ('completed' as const) 
        : isDistrictRejected 
          ? ('rejected' as const) 
          : isDistrictApproved 
            ? ('active' as const) 
            : ('pending' as const),
    },
    {
      step: '04',
      title: hasHostClub ? `Host: ${hostClubName}` : 'Host Club Allocation',
      desc: hasHostClub
        ? `Allocated to ${hostClubName}${hostClubZone}`
        : isDelegationConfirmed
          ? 'Host family and club pairing currently in progress by Committee'
          : 'Pending final delegation confirmation',
      status: hasHostClub 
        ? ('completed' as const) 
        : isDelegationConfirmed 
          ? ('active' as const) 
          : ('pending' as const),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#171515] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Profile Card & Subdomain Indicator */}
        <div className="p-6 bg-white rounded-3xl border-3 border-[#171515] ride-pop flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#19539D] border-2 border-[#171515] flex items-center justify-center text-white font-black text-xl ride-pop-sm shrink-0">
              {userName.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black uppercase text-[#171515] tracking-tight">
                  {userName}
                </h1>
                <Badge tone={statusBadgeTone}>
                  {statusBadgeLabel}
                </Badge>
              </div>
              <p className="text-xs text-neutral-600 font-semibold mt-0.5">
                {userDistrict ? `RID ${userDistrict} · ` : ''}{userClub ? `${userClub} · ` : ''}{userEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Official Reference</div>
              <div className="text-sm font-black text-[#19539D] font-mono">{userRef}</div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              leading={<LogOut size={14} />}
            >
              Log Out
            </Button>
          </div>
        </div>

        {/* Dashboard Section Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b-2 border-neutral-200">
          {[
            { id: 'status', label: 'Dashboard', count: undefined },
            { id: 'forms', label: 'Pending Forms', count: pendingForms.length },
            { id: 'resources', label: 'Drive Resources', count: resources.length },
            { id: 'inbox', label: 'Inbox & Announcements', count: announcements.length },
            { id: 'sessions', label: 'Active Sessions', count: undefined },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#19539D] text-white ride-pop-sm'
                  : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === tab.id ? 'bg-[#FBC02D] text-[#171515]' : 'bg-red-500 text-white'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: DASHBOARD & PROGRESS */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            {/* The Aesthetic Delhi Chapter Card */}
            <div className="relative overflow-hidden rounded-3xl border-3 border-[#171515] bg-[#FFFDF7] p-6 sm:p-8 ride-pop shadow-xl">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-[#EA6623]/10 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 rounded-full bg-[#19539D]/10 blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#171515] bg-[#FBC02D] text-[#171515] text-[10px] font-black uppercase tracking-wider ride-pop-sm">
                    <Sparkles size={12} />
                    <span>Delhi Meri Jaan 2026 • Official Exchange</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#171515]">
                    Your Delhi Chapter Awaits.
                  </h2>

                  <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-medium">
                    From the historic lanes of Chandni Chowk to the majestic lawns of India Gate, the capital is gearing up to welcome you with open arms, legendary hospitality, and memories of a lifetime. Get ready to experience Dilwaalon Ki Dilli like never before!
                  </p>

                  {/* ── Event Dates & Inclusions ── */}
                  <div className="pt-4 mt-4 border-t-2 border-dashed border-[#171515]/20 space-y-4">
                    <p className="text-base sm:text-lg font-black text-[#171515] tracking-tight">
                      20 &bull; 21 &bull; 22 November 2026
                    </p>
                    <p className="text-sm text-neutral-700 font-medium leading-relaxed">
                      Three days, two nights, and a city waiting to be experienced.
                    </p>

                    <div>
                      <p className="text-sm font-black text-[#171515] uppercase tracking-wide mb-2">
                        Your registration includes:
                      </p>
                      <ul className="space-y-1.5 text-sm text-neutral-700 font-medium">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                          Three days &amp; two nights of accommodation
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                          All meals: breakfast, lunch and dinner, with a taste of Delhi&rsquo;s culinary heritage
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                          Guided sightseeing, including entry tickets and curated group experiences
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                          Internal transportation within the city
                        </li>
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl border border-neutral-300 bg-neutral-50/80">
                      <p className="text-xs font-black text-neutral-600 uppercase tracking-wide mb-1">Not included</p>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        Travel to and from Delhi, personal shopping, and expenses outside the official programme.
                      </p>
                    </div>

                    <p className="text-sm text-neutral-600 italic leading-relaxed">
                      Come with an open heart, a curious mind, and a little room for the unexpected.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex md:flex-col items-center gap-3 w-full md:w-auto pt-2 md:pt-0">
                  <img
                    src="/ride/logos/2026_logo_coloured.png?v=2"
                    alt="Delhi Meri Jaan"
                    className="h-20 sm:h-24 w-auto object-contain ride-pop-sm p-2 rounded-2xl bg-white border-2 border-[#171515]"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border-2 border-[#171515] bg-white ride-pop-sm flex flex-col overflow-hidden">
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b-2 border-neutral-100">
                <h3 className="text-base font-black text-[#171515] uppercase tracking-wide">
                  Delegate Exchange Progress &amp; Dossier Status
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Follow your application review and district verification status for Delhi Meri Jaan 2026.
                  {' '}<span className="font-semibold text-neutral-700">Status reflects live data from the RID 3011 database.</span>
                </p>
              </div>

              {/* Vertical Stepper */}
              <div className="px-6 py-6 space-y-0">
                {dynamicMilestones.map((item, idx) => {
                  const isLast = idx === dynamicMilestones.length - 1;
                  const iconColor =
                    item.status === 'completed' ? 'bg-emerald-600 border-emerald-600' :
                    item.status === 'rejected'  ? 'bg-red-500 border-red-500' :
                    item.status === 'active'    ? 'bg-[#FBC02D] border-[#171515]' :
                                                  'bg-white border-neutral-300';
                  const connectorColor =
                    item.status === 'completed' ? 'bg-emerald-300' : 'bg-neutral-200';

                  return (
                    <div key={item.step} className="flex gap-4">
                      {/* Icon column */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 ${iconColor}`}>
                          {item.status === 'completed' ? (
                            <CheckCircle2 size={18} className="text-white" />
                          ) : item.status === 'rejected' ? (
                            <AlertCircle size={18} className="text-white" />
                          ) : item.status === 'active' ? (
                            <Clock size={18} className="text-[#171515]" />
                          ) : (
                            <span className="text-xs font-black text-neutral-400">{item.step}</span>
                          )}
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 flex-1 min-h-[32px] my-1 rounded-full ${connectorColor}`} />
                        )}
                      </div>

                      {/* Content column */}
                      <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black font-mono text-neutral-400 uppercase">Step {item.step}</span>
                          {item.status === 'completed' && (
                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wide">Complete</span>
                          )}
                          {item.status === 'active' && (
                            <span className="text-[10px] font-black bg-[#FBC02D]/20 text-[#171515] px-2 py-0.5 rounded-full uppercase tracking-wide border border-[#FBC02D]">In Progress</span>
                          )}
                          {item.status === 'rejected' && (
                            <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Declined</span>
                          )}
                          {item.status === 'pending' && (
                            <span className="text-[10px] font-black bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full uppercase tracking-wide">Pending</span>
                          )}
                        </div>
                        <div className="font-black text-sm text-[#171515] leading-snug">{item.title}</div>
                        <div className="text-xs text-neutral-600 mt-1 leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Update Banner — naturally inside the container, no overlap */}
              <div className="mx-6 mb-6 p-4 rounded-2xl border-2 border-[#171515] bg-[#FFFDF7]">
                <p className="text-sm font-extrabold text-[#171515] text-center leading-relaxed">
                  Keep checking for more updates on your application — we hope to see you soon!
                </p>
              </div>
            </div>
          </div>
        )}


        {/* TAB 2: PENDING FORMS DASHBOARD (CRITICAL ENGINE) */}
        {activeTab === 'forms' && (
          <div className="space-y-6">
            {pendingForms.length > 0 ? (
              <div className="p-4 rounded-2xl border-2 border-[#EA6623] bg-orange-50/70 flex items-start gap-3">
                <AlertCircle size={20} className="text-[#EA6623] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#EA6623]">
                    Action Required: {pendingForms.length} Pending Questionnaire{pendingForms.length === 1 ? '' : 's'}
                  </h4>
                  <p className="text-xs text-neutral-700 mt-0.5 font-medium">
                    The District Organizing Committee has published custom intake forms that require your response before arrivals commence.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-50 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-700" />
                <span>All assigned intake forms and questionnaires are complete! Check back as organizers publish supplemental event questionnaires.</span>
              </div>
            )}

            {/* Pending Forms Feed */}
            {pendingForms.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-700">
                  Forms Awaiting Your Completion
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingForms.map((form) => (
                    <Card
                      key={form.id}
                      rule="accent"
                      padding="compact"
                      className="border-2 border-[#171515] ride-pop-sm bg-white flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Badge tone="red">Action Required</Badge>
                          <span className="text-[10px] font-bold text-neutral-400 font-mono">
                            {form.fields.length} Questions
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-[#171515] leading-snug">
                          {form.title}
                        </h4>
                        <p className="text-xs text-neutral-600 line-clamp-2">
                          {form.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                        <span className="text-[10px] text-neutral-400">
                          Published by RID 3011 Admin
                        </span>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleOpenForm(form)}
                        >
                          Complete Form &rarr;
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Forms Section */}
            {completedForms.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-700">
                  Completed Questionnaires ({completedForms.length})
                </h3>
                <div className="space-y-2">
                  {completedForms.map((form) => {
                    const matchSub = userSubmissions.find((s) => s.formId === form.id);
                    return (
                      <div
                        key={form.id}
                        className="p-4 bg-white rounded-2xl border-2 border-neutral-200 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#171515]">{form.title}</span>
                            <Badge tone="green">Submitted</Badge>
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            {matchSub ? `Submitted on ${new Date(matchSub.submittedAt).toLocaleDateString('en-GB')}` : 'Recorded'}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenForm(form)}
                        >
                          Review Answers
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GOOGLE DRIVE RESOURCES */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-black text-[#171515] uppercase tracking-wide">
                Google Drive Resources & Delegate Files
              </h3>
              <p className="text-xs text-neutral-600 mt-0.5">
                Official guidelines, route manifests, and hospitality dossiers provided for your exchange trail.
              </p>
            </div>

            {resources.length === 0 ? (
              <div className="p-10 text-center rounded-2xl border-2 border-dashed border-neutral-300 bg-white">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  No Google Drive resources currently attached
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  When the RIDE Organizing Committee uploads official drive dossiers, they will be listed here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map((res) => (
                  <Card
                    key={res.id}
                    rule="accent"
                    padding="compact"
                    className="border-2 border-[#171515] ride-pop-sm bg-white flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge tone="blue">{res.category}</Badge>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                          Authorized Access
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-[#171515] leading-snug">
                        {res.title}
                      </h4>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {res.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(res)}
                        className="p-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-neutral-600 text-xs flex items-center gap-1 cursor-pointer"
                        title="Copy Drive URL"
                      >
                        {copiedResId === res.id ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                      </button>

                      <a
                        href={res.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#19539D] text-white text-xs font-black hover:bg-blue-800 transition-all cursor-pointer"
                      >
                        <span>Open in Drive</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ANNOUNCEMENTS & INBOX */}
        {activeTab === 'inbox' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-black text-[#171515] uppercase tracking-wide">
                Delegate Inbox & Bespoke Announcements
              </h3>
              <p className="text-xs text-neutral-600 mt-0.5">
                Official broadcasts dispatched directly from the District 3011 Exchange Secretariat.
              </p>
            </div>

            {announcements.length === 0 ? (
              <div className="p-10 text-center rounded-2xl border-2 border-dashed border-neutral-300 bg-white">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  No announcements received yet
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Important delegate advisories, event schedules, and logistics broadcasts will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-2xl border-2 border-[#171515] bg-white overflow-hidden ride-pop-sm"
                  >
                    {/* Bespoke Continuous Yellow Line Strip */}
                    <div className="bg-[#FBC02D] px-4 py-1.5 border-b-2 border-[#171515] flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#171515]">
                      <span>DELHI MERI JAAN 2026 • OFFICIAL DISPATCH</span>
                      <span>{new Date((msg as any).sentAt || (msg as any).createdAt || Date.now()).toLocaleDateString('en-GB')}</span>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-[#171515]">{msg.subject}</h4>
                        <Badge tone="pink">{msg.audienceScope}</Badge>
                      </div>

                      <div className="text-[11px] text-neutral-500 font-bold">
                        From: {msg.sender}
                      </div>

                      <div className="p-4 bg-[#FDFBF7] rounded-xl border border-neutral-200 text-xs leading-relaxed text-neutral-800 whitespace-pre-wrap font-sans">
                        {msg.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ACTIVE SESSIONS & DEVICE SECURITY */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <Card rule="accent" padding="compact" className="border-2 border-[#171515] ride-pop-sm space-y-5 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200">
                <div>
                  <h3 className="text-base font-black text-[#171515] uppercase tracking-wide">
                    Active Participant Sessions & Device Management
                  </h3>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Monitor devices currently authenticated into your delegate profile across the platform.
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleLogout}
                  leading={<LogOut size={14} />}
                >
                  Log Out
                </Button>
              </div>

              {/* Devices List */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-neutral-200 bg-[#FDFBF7] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white border border-neutral-300 text-[#171515]">
                      {typeof navigator !== 'undefined' && navigator.userAgent.includes('Mobile') ? (
                        <Smartphone size={18} />
                      ) : (
                        <Monitor size={18} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#171515]">
                          {typeof navigator !== 'undefined' && navigator.userAgent.includes('Windows')
                            ? 'Chrome / Edge on Windows'
                            : typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac')
                              ? 'Safari / Chrome on macOS'
                              : typeof navigator !== 'undefined' && navigator.userAgent.includes('iPhone')
                                ? 'Mobile Safari on iOS'
                                : typeof navigator !== 'undefined' && navigator.userAgent.includes('Android')
                                  ? 'Chrome on Android'
                                  : 'Web Browser Session'}
                        </span>
                        <Badge tone="green">Current Device</Badge>
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Authenticated as {userEmail || userName} · Active now
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleLogout}
                  >
                    Log Out
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

      </div>

      {/* Fill Form Interactive Modal */}
      {activeFillingForm && (
        <Modal
          open={!!activeFillingForm}
          onClose={() => setActiveFillingForm(null)}
          title={`Intake Form • ${activeFillingForm.title}`}
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" onClick={() => setActiveFillingForm(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={formSubmitting}
                disabled={formSubmitting}
                onClick={handleSubmitForm}
              >
                Submit Form to RID 3011
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto px-1">
            {submissionSuccess ? (
              <div className="p-6 text-center space-y-2 bg-green-50 rounded-2xl border-2 border-green-600">
                <CheckCircle2 size={32} className="mx-auto text-green-700" />
                <h4 className="text-sm font-black text-green-950 uppercase">Form Submitted Successfully!</h4>
                <p className="text-xs text-green-800">Your answers have been securely routed back to the District 3011 Admin Portal.</p>
              </div>
            ) : (
              <>
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                  <h4 className="text-xs font-black text-[#171515]">{activeFillingForm.title}</h4>
                  <p className="text-[11px] text-neutral-600 mt-0.5">{activeFillingForm.description}</p>
                </div>

                <div className="space-y-4">
                  {activeFillingForm.fields.map((field) => (
                    <div key={field.id} className="space-y-1">
                      <label className="block text-xs font-black text-neutral-800">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.helperText && (
                        <p className="text-[11px] text-neutral-500 font-medium leading-tight mb-1">{field.helperText}</p>
                      )}

                      {field.type === 'select' ? (
                        <select
                          value={formFieldValues[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs bg-white font-medium"
                        >
                          <option value="">-- Choose an option --</option>
                          {(field.options || []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={formFieldValues[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-sans"
                        />
                      ) : field.type === 'checkbox' ? (
                        <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={!!formFieldValues[field.name]}
                            onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                            className="rounded text-[#19539D]"
                          />
                          <span>{field.placeholder || 'I acknowledge and agree'}</span>
                        </label>
                      ) : (
                        <div>
                          <input
                            type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                            value={
                              field.name === 'homeDistrict' && (activeFillingForm.id === 'form-delegation-confirm' || activeFillingForm.slug?.includes('confirmation'))
                                ? (userDistrict || formFieldValues[field.name] || '')
                                : (formFieldValues[field.name] || '')
                            }
                            onChange={(e) => {
                              if (field.name === 'homeDistrict' && (activeFillingForm.id === 'form-delegation-confirm' || activeFillingForm.slug?.includes('confirmation'))) return;
                              handleFieldChange(field.name, e.target.value);
                            }}
                            disabled={field.name === 'homeDistrict' && (activeFillingForm.id === 'form-delegation-confirm' || activeFillingForm.slug?.includes('confirmation'))}
                            readOnly={field.name === 'homeDistrict' && (activeFillingForm.id === 'form-delegation-confirm' || activeFillingForm.slug?.includes('confirmation'))}
                            placeholder={field.placeholder}
                            className={`w-full px-3 py-2 rounded-xl border text-xs ${
                              field.name === 'homeDistrict' && (activeFillingForm.id === 'form-delegation-confirm' || activeFillingForm.slug?.includes('confirmation'))
                                ? 'bg-neutral-100 border-neutral-300 text-neutral-600 font-bold cursor-not-allowed select-none'
                                : 'border-neutral-300'
                            }`}
                          />
                          {field.name === 'homeDistrict' && (activeFillingForm.id === 'form-delegation-confirm' || activeFillingForm.slug?.includes('confirmation')) && (
                            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 mt-1 font-semibold">
                              <ShieldCheck size={13} className="shrink-0" />
                              <span>Locked: Registered Rotary International District assignment</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
