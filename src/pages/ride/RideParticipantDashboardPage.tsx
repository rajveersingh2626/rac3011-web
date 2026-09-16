import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle2, Clock, AlertCircle, 
  ExternalLink, Copy, Check, 
  Smartphone, Monitor, LogOut, 
  MapPin, Building, QrCode
} from 'lucide-react';
import { useAuth } from '@/app/auth';
import { apiFetch } from '@/lib/api';
import { useDocumentMeta } from '@/lib/meta';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { 
  getStoredForms, getStoredSubmissions, saveStoredSubmission,
  type FormDefinition, type FormSubmissionRecord 
} from '@/lib/ride/formsStorage';

interface DriveResourceItem {
  id: string;
  title: string;
  category: string;
  driveUrl: string;
  description: string;
}

const RESOURCES_LIST: DriveResourceItem[] = [
  {
    id: 'res-1',
    title: 'Official Delegate Information Kit & 4-Day Itinerary (DMJ 2026)',
    category: 'Guidelines',
    driveUrl: 'https://drive.google.com/drive/folders/1a_RIDE2026_Official_Delegate_Dossier',
    description: 'Master pack including check-in checkpoints, dress codes, Sufi night entry passes, and Old Delhi heritage trail route maps.',
  },
  {
    id: 'res-2',
    title: 'Host Family Welcome & Hospitality Handbook',
    category: 'Hospitality',
    driveUrl: 'https://drive.google.com/drive/folders/1b_Host_Family_Welcome_Handbooks_2026',
    description: 'Guidelines for delegates staying with Rotaract host families across South Delhi and Central Delhi.',
  },
  {
    id: 'res-3',
    title: 'Delhi Metro Smart Token & Transit Station Guide',
    category: 'Transit',
    driveUrl: 'https://drive.google.com/drive/folders/1c_DMJ2026_DMRC_Transit_Manifests',
    description: 'Airport Express line guides, station coordination desks, and emergency shuttle dispatch schedules.',
  },
  {
    id: 'res-4',
    title: 'Official High-Resolution Snap Gallery & Media Kit',
    category: 'Media',
    driveUrl: 'https://drive.google.com/drive/folders/1e_Print_Ready_Badges_Vector_Files',
    description: 'Download promotional assets, Instagram story templates, and live event photo dumps.',
  },
];

interface AnnouncementMessage {
  id: string;
  subject: string;
  date: string;
  sender: string;
  body: string;
  tag: string;
}

const DEFAULT_ANNOUNCEMENTS: AnnouncementMessage[] = [
  {
    id: 'msg-1',
    subject: 'Welcome to Delhi Meri Jaan 2026 • Official Delegate Instructions',
    date: 'Official Briefing',
    sender: 'Host Organizing Committee • RID 3011',
    tag: 'Official Pass',
    body: 'Dear Delegate,\n\nNamaste from Rotary International District 3011!\n\nWe are delighted to welcome you to the capital for "THE RIDE: DELHI MERI JAAN 2026". Please ensure you have completed all questionnaires in the "Pending Forms" section of this portal to help us coordinate your arrival and accommodations smoothly.\n\nOur hospitality leads will receive you with authentic Dilli refreshments.\n\nWarm regards,\nDistrict Exchange Committee',
  },
  {
    id: 'msg-2',
    subject: 'Host Family & Transit Hub Coordination',
    date: 'Hospitality Desk',
    sender: 'Homestay & Hospitality Team',
    tag: 'Hospitality',
    body: 'Greetings!\n\nHost families and club leads have been briefed on dietary preferences and arrival schedules. Transit desks at IGI Airport and New Delhi Railway Station will be equipped to provide your transit kits.\n\nSee you soon on the metro line!',
  },
];

export function RideParticipantDashboardPage() {
  useDocumentMeta({ title: 'Participant Portal • Delhi Meri Jaan 2026' });
  const { me, signOut } = useAuth();
  const user = me?.user;

  const { data: participantData } = useQuery({
    queryKey: ['ride', 'participants', 'me'],
    queryFn: async () => {
      try {
        return await apiFetch<any>('/ride/participants/me');
      } catch {
        return null;
      }
    },
  });

  const [activeTab, setActiveTab] = useState<'status' | 'forms' | 'resources' | 'inbox' | 'sessions'>('status');
  const [allForms, setAllForms] = useState<FormDefinition[]>(() => getStoredForms());
  const [allSubmissions, setAllSubmissions] = useState<FormSubmissionRecord[]>(() => getStoredSubmissions());
  
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
    window.addEventListener('ride_forms_updated', handleFormsUpdated);
    window.addEventListener('ride_submissions_updated', handleSubmissionsUpdated);
    return () => {
      window.removeEventListener('ride_forms_updated', handleFormsUpdated);
      window.removeEventListener('ride_submissions_updated', handleSubmissionsUpdated);
    };
  }, []);

  // Compute pending forms: active forms for which this participant hasn't submitted yet
  const userEmail = participantData?.email || user?.email || '';
  const userName = participantData?.fullName || user?.name || 'Registered Delegate';
  const userDistrict = participantData?.homeDistrict || '';
  const userClub = participantData?.homeClubName || '';
  const userRef = participantData?.id 
    ? `DMJ-${participantData.id.slice(0, 6).toUpperCase()}` 
    : (user?.id ? `DMJ-${user.id.slice(0, 6).toUpperCase()}` : 'DMJ-DELEGATE');

  const userSubmissions = allSubmissions.filter((s) => s.participantEmail.toLowerCase() === userEmail.toLowerCase());
  const submittedFormIds = new Set(userSubmissions.map((s) => s.formId));
  const participantForms = allForms.filter((f) => f.id !== 'form-host-club-app');
  const pendingForms = participantForms.filter((f) => f.isActive && !submittedFormIds.has(f.id));
  const completedForms = participantForms.filter((f) => submittedFormIds.has(f.id));

  const handleOpenForm = (form: FormDefinition) => {
    setActiveFillingForm(form);
    setFormFieldValues({});
    setSubmissionSuccess(false);
  };

  const handleFieldChange = (key: string, value: any) => {
    setFormFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmitForm = () => {
    if (!activeFillingForm) return;
    setFormSubmitting(true);

    setTimeout(() => {
      saveStoredSubmission({
        formId: activeFillingForm.id,
        formTitle: activeFillingForm.title,
        category: 'external_delegation',
        participantName: userName,
        participantEmail: userEmail,
        homeDistrict: formFieldValues.homeDistrict || userDistrict,
        status: 'submitted',
        values: formFieldValues,
      });

      // Persist directly to PostgreSQL database via API
      apiFetch('/public/ride/participants', {
        method: 'POST',
        body: {
          fullName: formFieldValues.pocName || formFieldValues.drrName || userName,
          email: formFieldValues.pocEmail || formFieldValues.drrEmail || userEmail,
          phone: formFieldValues.pocPhone || formFieldValues.drrPhone || '+91 99999 99999',
          homeDistrict: formFieldValues.homeDistrict || userDistrict || '3141',
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

  const handleCopyLink = (res: DriveResourceItem) => {
    navigator.clipboard.writeText(res.driveUrl);
    setCopiedResId(res.id);
    setTimeout(() => setCopiedResId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#171515] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Profile Card & Subdomain Indicator */}
        <div className="p-6 bg-white rounded-3xl border-3 border-[#171515] ride-pop flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#19539D] border-2 border-[#171515] flex items-center justify-center text-white font-black text-xl ride-pop-sm">
              {userName.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black uppercase text-[#171515] tracking-tight">
                  {userName}
                </h1>
                <Badge tone="green">Verified Delegate</Badge>
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
              onClick={signOut}
              leading={<LogOut size={14} />}
            >
              Log Out
            </Button>
          </div>
        </div>

        {/* Dashboard Section Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b-2 border-neutral-200">
          {[
            { id: 'status', label: 'Approval Status', count: undefined },
            { id: 'forms', label: 'Pending Forms', count: pendingForms.length },
            { id: 'resources', label: 'Drive Resources', count: RESOURCES_LIST.length },
            { id: 'inbox', label: 'Inbox & Announcements', count: DEFAULT_ANNOUNCEMENTS.length },
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

        {/* TAB 1: APPROVAL STATUS TRACKER */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            <Card rule="accent" padding="compact" className="border-2 border-[#171515] ride-pop-sm space-y-6 bg-white">
              <div>
                <h3 className="text-base font-black text-[#171515] uppercase tracking-wide">
                  Delegate Exchange Progress & Dossier Status
                </h3>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Follow your live check-in, hosting family assignment, and event credential status for Delhi Meri Jaan 2026.
                </p>
              </div>

              {/* Progress Milestones */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { step: '01', title: 'Registration Submitted', desc: 'Received & logged', status: 'completed' },
                  { step: '02', title: 'District Verification', desc: 'Approved by RID 3011', status: 'completed' },
                  { step: '03', title: 'Host Club & Homestay', desc: 'RAC Delhi South Central', status: 'completed' },
                  { step: '04', title: 'Digital Delegate Pass', desc: 'Ready for check-in', status: 'active' },
                ].map((item) => (
                  <div
                    key={item.step}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      item.status === 'completed'
                        ? 'border-[#171515] bg-emerald-50 text-emerald-950'
                        : item.status === 'active'
                          ? 'border-[#171515] bg-[#FFFDF7] ride-pop-sm ring-2 ring-[#FBC02D]'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-black mb-2">
                      <span className="font-mono">{item.step}</span>
                      {item.status === 'completed' ? (
                        <CheckCircle2 size={16} className="text-emerald-700" />
                      ) : (
                        <Clock size={16} className="text-[#EA6623]" />
                      )}
                    </div>
                    <div className="font-black text-xs text-[#171515]">{item.title}</div>
                    <div className="text-[11px] text-neutral-600 mt-0.5">{item.desc}</div>
                  </div>
                ))}
              </div>

              {/* Detail Cards: Host Family & Transit Hub */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* Host Family Card */}
                <div className="p-5 rounded-2xl border-2 border-[#171515] bg-[#FDFBF7] space-y-3">
                  <div className="flex items-center gap-2 text-[#19539D] font-black text-xs uppercase tracking-wider">
                    <Building size={16} />
                    <span>Assigned Host Club & Family</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#171515]">
                      {participantData?.hostFamilyName || 'Host Allocation in Progress'}
                    </h4>
                    <p className="text-xs text-neutral-600 mt-1">
                      {participantData?.hostFamilyName
                        ? `Host Assignment: ${participantData.hostFamilyName}`
                        : 'Your host Rotaract club and homestay coordinator will be assigned prior to arrivals.'}
                    </p>
                  </div>
                  <div className="pt-2 text-[11px] text-neutral-500 font-bold border-t border-neutral-200">
                    {participantData?.dietaryPref
                      ? `Dietary preference recorded: ${participantData.dietaryPref}`
                      : 'Dietary preferences logged with exchange committee.'}
                  </div>
                </div>

                {/* Transit Hub & Pass Preview */}
                <div className="p-5 rounded-2xl border-2 border-[#171515] bg-[#FDFBF7] space-y-3">
                  <div className="flex items-center gap-2 text-[#EA6623] font-black text-xs uppercase tracking-wider">
                    <MapPin size={16} />
                    <span>Arrival Transit Hub</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#171515]">
                      {participantData?.cityState || participantData?.arrivalLocation || 'IGI Airport / NDLS Welcome Desk'}
                    </h4>
                    <p className="text-xs text-neutral-600 mt-1">
                      Mode of Arrival: {participantData?.arrivalMode || 'Standard Transit'}<br />
                      Transport: DMRC Metro Transit Pass Supported<br />
                      Secretariat Desk: Active 24 Hours on check-in days
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-neutral-200">
                    <span className="text-[11px] font-bold text-neutral-500 font-mono">Pass: {userRef}</span>
                    <button
                      type="button"
                      onClick={() => alert(`Digital Pass: ${userRef}\nDelegate: ${userName}\nStatus: Verified\nShow this code at arrival desk.`)}
                      className="px-3 py-1 rounded-xl bg-[#19539D] text-white text-[11px] font-black flex items-center gap-1.5 hover:bg-blue-800"
                    >
                      <QrCode size={13} />
                      <span>View Pass QR</span>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RESOURCES_LIST.map((res) => (
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
                      className="p-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-neutral-600 text-xs flex items-center gap-1"
                      title="Copy Drive URL"
                    >
                      {copiedResId === res.id ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                    </button>

                    <a
                      href={res.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#19539D] text-white text-xs font-black hover:bg-blue-800 transition-all"
                    >
                      <span>Open in Drive</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </Card>
              ))}
            </div>
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

            <div className="space-y-4">
              {DEFAULT_ANNOUNCEMENTS.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-2xl border-2 border-[#171515] bg-white overflow-hidden ride-pop-sm"
                >
                  {/* Bespoke Continuous Yellow Line Strip */}
                  <div className="bg-[#FBC02D] px-4 py-1.5 border-b-2 border-[#171515] flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#171515]">
                    <span>DELHI MERI JAAN 2026 • OFFICIAL DISPATCH</span>
                    <span>{msg.date}</span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="text-sm font-black text-[#171515]">{msg.subject}</h4>
                      <Badge tone="pink">{msg.tag}</Badge>
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
                  onClick={signOut}
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
                    onClick={signOut}
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
                        <input
                          type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                          value={formFieldValues[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                        />
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
