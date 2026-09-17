import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Building2, Sparkles, CheckCircle2, ArrowRight, 
  ExternalLink, FileText, AlertCircle, Clock 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { useAuth } from '@/app/auth';
import { apiFetch } from '@/lib/api';
import { fetchPublicClubs } from '@/lib/clubs';
import { 
  getStoredSubmissions, 
  saveStoredSubmission, 
  type FormSubmissionRecord 
} from '@/lib/ride/formsStorage';

export function HostClubApplicationCard() {
  const { me } = useAuth();
  const user = me?.user;
  const userProfile = me?.profile;

  const [isOpen, setIsOpen] = useState(false);
  const [viewSubmittedModal, setViewSubmittedModal] = useState(false);
  const [submissions, setSubmissions] = useState<FormSubmissionRecord[]>(() => getStoredSubmissions());

  // Form states
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(userProfile?.fullName || user?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [position, setPosition] = useState('Club President');
  const [clubName, setClubName] = useState((userProfile as any)?.club?.name || (me as any)?.clubs?.[0]?.name || '');
  const [parentRotaryClub, setParentRotaryClub] = useState('');
  const [zone, setZone] = useState('Zone Prithvi');
  const [motivation, setMotivation] = useState('');
  const [pastHostingExperience, setPastHostingExperience] = useState('');
  const [proposalDriveUrl, setProposalDriveUrl] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch RID 3011 clubs
  const { data: clubsList = [] } = useQuery({
    queryKey: ['public-clubs-list'],
    queryFn: () => fetchPublicClubs(),
  });

  useEffect(() => {
    const handleSubmissionsUpdated = () => setSubmissions(getStoredSubmissions());
    window.addEventListener('ride_submissions_updated', handleSubmissionsUpdated);
    return () => window.removeEventListener('ride_submissions_updated', handleSubmissionsUpdated);
  }, []);

  // Check if current user or club has already submitted
  const currentSubmission = submissions.find(
    (s) => s.formId === 'form-host-club-app' && (
      s.participantEmail.toLowerCase() === (user?.email || '').toLowerCase() ||
      (clubName && s.clubName?.toLowerCase() === clubName.toLowerCase())
    )
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!email.trim() || !name.trim() || !phone.trim() || !position.trim() || !clubName.trim()) {
      setError('Please fill in all identity and club fields.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!parentRotaryClub.trim()) {
      setError('Please specify the Parent Rotary Club Name (or type NA).');
      return;
    }
    if (!motivation.trim() || motivation.length < 30) {
      setError('Please provide a meaningful explanation of why your club should be selected as a Host Club (at least 30 characters).');
      return;
    }
    if (!pastHostingExperience.trim()) {
      setError('Please provide past hosting experience details (or type NA).');
      return;
    }
    if (!proposalDriveUrl.trim()) {
      setError('Please provide the Google Drive link to your club proposal.');
      return;
    }
    if (!proposalDriveUrl.startsWith('http://') && !proposalDriveUrl.startsWith('https://')) {
      setError('Google Drive link must start with https://');
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      saveStoredSubmission({
        formId: 'form-host-club-app',
        formTitle: 'Delhi Meri Jaan - Rotaract Inter-District Exchange (RIDE) – Host Club Application',
        category: 'internal_host_club',
        participantName: name.trim(),
        participantEmail: email.trim(),
        homeDistrict: '3011',
        clubName: clubName.trim(),
        status: 'submitted',
        values: {
          email: email.trim(),
          name: name.trim(),
          phone: phone.trim(),
          position: position.trim(),
          clubName: clubName.trim(),
          parentRotaryClub: parentRotaryClub.trim(),
          zone,
          motivation: motivation.trim(),
          pastHostingExperience: pastHostingExperience.trim(),
          proposalDriveUrl: proposalDriveUrl.trim(),
        },
      });

      setSubmissions(getStoredSubmissions());

      // Persist to PostgreSQL database custom_form_submissions via Forms API
      apiFetch('/forms/delhi-meri-jaan-host-club-application-2026/submit', {
        method: 'POST',
        body: {
          applicantName: name.trim(),
          applicantEmail: email.trim(),
          applicantPhone: phone.trim(),
          clubId: (userProfile as any)?.clubId || (me as any)?.clubs?.[0]?.id,
          clubName: clubName.trim(),
          values: {
            email: email.trim(),
            name: name.trim(),
            phone: phone.trim(),
            position: position.trim(),
            clubName: clubName.trim(),
            parentRotaryClub: parentRotaryClub.trim(),
            zone,
            motivation: motivation.trim(),
            pastHostingExperience: pastHostingExperience.trim(),
            proposalDriveUrl: proposalDriveUrl.trim(),
          },
        },
      }).catch(() => undefined);

      const targetClubId = (userProfile as any)?.clubId || (me as any)?.clubs?.[0]?.id;
      if (targetClubId) {
        apiFetch('/ride/support-clubs', {
          method: 'POST',
          body: {
            clubId: targetClubId,
            ryYear: 2026,
            capacityDelegates: 10,
            homestayAvailable: true,
            contactPhone: phone.trim(),
            notes: `Google Drive Proposal: ${proposalDriveUrl.trim()} | Position: ${position.trim()} | Zone: ${zone} | Motivation: ${motivation.trim()}`,
          },
        }).catch(() => undefined);
      }

      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 2000);
    }, 600);
  };

  return (
    <>
      <div className="rounded-3xl border-2 border-[#171515] bg-gradient-to-br from-[#FFFDF7] via-white to-amber-50/40 p-6 sm:p-8 ride-pop-sm shadow-sm relative overflow-hidden">
        {/* Background Emblem Watermark */}
        <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
          <Building2 size={160} />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full border border-[#171515] bg-[#FBC02D] text-[#171515] text-[11px] font-black uppercase tracking-wider ride-pop-sm flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>Delhi Meri Jaan 2026</span>
              </span>
              <Badge tone={currentSubmission ? 'blue' : 'amber'}>
                {currentSubmission ? 'Application Registered' : 'Host Club Call Open'}
              </Badge>
              {currentSubmission && (
                <span className="text-xs font-bold text-neutral-600 flex items-center gap-1">
                  <Clock size={13} className="text-[#19539D]" />
                  <span>Status: <strong className="capitalize text-[#19539D]">{currentSubmission.status.replace('_', ' ')}</strong></span>
                </span>
              )}
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-[#171515] tracking-tight">
                Delhi Meri Jaan - Rotaract Inter-District Exchange (RIDE) – Host Club Application
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed font-medium">
                Calling all RID 3011 Club Presidents & Secretaries! Apply for your Rotaract Club to host national & international youth delegates during the flagship Delhi Meri Jaan exchange.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            {currentSubmission ? (
              <Button
                variant="secondary"
                size="md"
                onClick={() => setViewSubmittedModal(true)}
                leading={<FileText size={16} />}
              >
                View Submitted Proposal
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsOpen(true)}
                trailing={<ArrowRight size={16} />}
                className="bg-[#EA6623] hover:bg-orange-600 text-white font-black"
              >
                Apply as Host Club
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Delhi Meri Jaan - Rotaract Inter-District Exchange (RIDE) – Host Club Application"
        size="lg"
      >
        {success ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-black text-[#171515]">Application Submitted!</h3>
            <p className="text-xs text-neutral-600 max-w-md mx-auto">
              Your club application has been successfully logged. The District RIDE Committee will review your proposal in the "Needs Attention" queue.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border-2 border-red-400 text-red-900 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-900 text-xs">
              <span className="font-bold">Official RID 3011 Opportunity:</span> Selected host clubs will receive dedicated visiting delegates, official exchange citations, and fellowship hosting points.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label="Contact Email" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="president@club.rotaract3011.org"
                />
              </Field>

              <Field label="Applicant Full Name" required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                />
              </Field>

              <Field label="Contact Number" required>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </Field>

              <Field label="Position in the Club" required>
                <Input
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Club President / Club Secretary"
                />
              </Field>

              <Field label="Rotaract Club Name" required>
                {clubsList.length > 0 ? (
                  <Select
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    options={[
                      { value: '', label: 'Select your Rotaract Club...' },
                      ...clubsList.map((c) => ({ value: c.name, label: c.name })),
                    ]}
                  />
                ) : (
                  <Input
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    placeholder="Enter club name"
                  />
                )}
              </Field>

              <Field label="Parent Rotary Club Name" hint="Mention NA if not applicable" required>
                <Input
                  value={parentRotaryClub}
                  onChange={(e) => setParentRotaryClub(e.target.value)}
                  placeholder="Rotary Club of ..."
                />
              </Field>
            </div>

            <Field label="Zone" required>
              <Select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                options={[
                  { value: 'Zone Prithvi', label: 'Zone Prithvi' },
                  { value: 'Zone Agni', label: 'Zone Agni' },
                  { value: 'Zone Vayu', label: 'Zone Vayu' },
                  { value: 'Zone Akash', label: 'Zone Akash' },
                ]}
              />
            </Field>

            <Field label="Why your club should be selected as a Host Club?" required>
              <textarea
                rows={3}
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="Describe your club's fellowship spirit, member enthusiasm, and why visiting delegates will have a memorable homestay experience with your members..."
                className="w-full p-3 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-[#19539D] focus:outline-none"
              />
            </Field>

            <Field label="Has your club hosted inter-district/international Rotaractors before? If yes, share brief details." required>
              <textarea
                rows={2}
                value={pastHostingExperience}
                onChange={(e) => setPastHostingExperience(e.target.value)}
                placeholder="Detail any previous hosting arrangements, or write 'NA' if this is your first exchange."
                className="w-full p-3 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-[#19539D] focus:outline-none"
              />
            </Field>

            <Field 
              label="Upload Your Club's Proposal (Google Drive Link)" 
              hint="Paste the Google Drive link to your club proposal document or presentation. Please ensure the link sharing permission is set to 'Anyone with the link can view'. The club proposal may contain the motivation/vision, proposed plan for accommodation, local transportation & food, key activities & unique experiences, possible challenges & plan to overcome them."
              required
            >
              <Input
                value={proposalDriveUrl}
                onChange={(e) => setProposalDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/... or file link"
              />
            </Field>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                className="bg-[#EA6623] hover:bg-orange-600 text-white font-black"
              >
                Submit Host Club Application
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* View Submitted Modal */}
      <Modal
        open={viewSubmittedModal}
        onClose={() => setViewSubmittedModal(false)}
        title="Your Submitted Host Club Application"
        size="md"
      >
        {currentSubmission && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black uppercase text-blue-700">Application Status</div>
                <div className="text-sm font-black capitalize text-blue-950">{currentSubmission.status.replace('_', ' ')}</div>
              </div>
              <Badge tone={currentSubmission.status === 'approved' ? 'green' : 'blue'}>
                {currentSubmission.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 border p-3 rounded-xl bg-neutral-50">
              <div>
                <div className="text-[10px] font-bold text-neutral-500 uppercase">Club Name</div>
                <div className="font-black text-neutral-900">{currentSubmission.clubName}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-neutral-500 uppercase">Applicant</div>
                <div className="font-black text-neutral-900">{currentSubmission.participantName} ({currentSubmission.values?.position})</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-neutral-500 uppercase">Contact</div>
                <div className="font-mono">{currentSubmission.values?.phone} · {currentSubmission.participantEmail}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-neutral-500 uppercase">Zone & Parent Rotary</div>
                <div className="font-semibold">{currentSubmission.values?.zone} · {currentSubmission.values?.parentRotaryClub}</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-bold text-neutral-700">Why Selected:</div>
              <p className="p-3 bg-neutral-50 rounded-xl border text-neutral-700">{currentSubmission.values?.motivation}</p>
            </div>

            {currentSubmission.values?.proposalDriveUrl && (
              <div className="pt-2">
                <a
                  href={currentSubmission.values.proposalDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#171515] bg-[#FBC02D] text-[#171515] font-black hover:bg-yellow-400 transition-all ride-pop-sm"
                >
                  <ExternalLink size={15} />
                  <span>Open Uploaded Club Proposal in Google Drive</span>
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
