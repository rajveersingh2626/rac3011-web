export type FormFieldType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'phone' 
  | 'date' 
  | 'select' 
  | 'textarea' 
  | 'checkbox';

export interface FormFieldDefinition {
  id: string;
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  helperText?: string;
  options?: string[];
}

export interface FormDefinition {
  id: string;
  slug: string;
  title: string;
  description: string;
  version: number;
  isActive: boolean;
  isPublic: boolean;
  fields: FormFieldDefinition[];
  createdAt: string;
}

export interface FormSubmissionRecord {
  id: string;
  formId: string;
  formTitle: string;
  category: 'external_delegation' | 'internal_host_club';
  participantId?: string;
  participantName: string;
  participantEmail: string;
  homeDistrict: string;
  clubName?: string;
  status: 'submitted' | 'under_review' | 'approved' | 'declined';
  values: Record<string, any>;
  submittedAt: string;
  notes?: string;
}

const FORMS_STORAGE_KEY = 'rac3011_ride_forms_v2';
const SUBMISSIONS_STORAGE_KEY = 'rac3011_ride_submissions_v2';

export const DEFAULT_FORMS: FormDefinition[] = [
  {
    id: 'form-delegation-confirm',
    slug: 'delhi-meri-jaan-confirmation-2026',
    title: 'Delhi Meri Jaan - Confirmation Form',
    description: 'Official confirmation and delegation details for participating outside districts.',
    version: 1,
    isActive: true,
    isPublic: true,
    createdAt: '2026-09-16',
    fields: [
      { id: 'f1', name: 'homeDistrict', label: 'Rotary International District Number', type: 'text', required: true, placeholder: 'e.g. 3141' },
      { id: 'f2', name: 'drrName', label: 'Name of District Rotaract Representative', type: 'text', required: true, placeholder: 'Enter DRR full name' },
      { id: 'f3', name: 'drrPhone', label: 'Contact Number of District Rotaract Representative', type: 'phone', required: true, placeholder: '+91 XXXXX XXXXX' },
      { id: 'f4', name: 'drrEmail', label: 'Email Address of District Rotaract Representative', type: 'email', required: true, placeholder: 'drr@district.org' },
      { 
        id: 'f5', 
        name: 'pocName', 
        label: 'Name of Point of Contact (POC)', 
        type: 'text', 
        required: true, 
        placeholder: 'Enter POC full name',
        helperText: 'It can be any individual appointed by the District Representative (DRR) to serve as the primary liaison for all communications related to the RIDE between the Incoming District and the Organizing Team. For example, District ISD, District Rotaract Secretary, or any other designated member.' 
      },
      { id: 'f6', name: 'pocPhone', label: 'Contact Number of Point of Contact (POC)', type: 'phone', required: true, placeholder: '+91 XXXXX XXXXX' },
      { id: 'f7', name: 'pocEmail', label: 'Email Address of Point of Contact (POC)', type: 'email', required: true, placeholder: 'poc@district.org' },
    ],
  },
  {
    id: 'form-host-club-app',
    slug: 'delhi-meri-jaan-host-club-application-2026',
    title: 'Delhi Meri Jaan - Rotaract Inter-District Exchange (RIDE) – Host Club Application',
    description: 'Official application for RID 3011 Rotaract Clubs to host incoming national and international delegates.',
    version: 1,
    isActive: true,
    isPublic: true,
    createdAt: '2026-09-16',
    fields: [
      { id: 'hf1', name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'president@club.rotaract3011.org' },
      { id: 'hf2', name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Full Name' },
      { id: 'hf3', name: 'phone', label: 'Contact Number', type: 'phone', required: true, placeholder: '+91 98765 43210' },
      { id: 'hf4', name: 'position', label: 'Position in the Club', type: 'text', required: true, placeholder: 'e.g. Club President / Club Secretary' },
      { id: 'hf5', name: 'clubName', label: 'Rotaract Club Name', type: 'select', required: true },
      { id: 'hf6', name: 'parentRotaryClub', label: 'Parent Rotary Club Name', type: 'text', required: true, helperText: 'Mention NA if not applicable', placeholder: 'Rotary Club of ...' },
      { id: 'hf7', name: 'zone', label: 'Zone', type: 'select', required: true, options: ['Zone Prithvi', 'Zone Agni', 'Zone Vayu', 'Zone Akash'] },
      { id: 'hf8', name: 'motivation', label: 'Why your club should be selected as a Host Club?', type: 'textarea', required: true, placeholder: 'Describe your club motivation and hosting strengths...' },
      { id: 'hf9', name: 'pastHostingExperience', label: 'Has your club hosted inter-district/international Rotaractors before? If yes, share brief details.', type: 'textarea', required: true, placeholder: 'Share any previous hosting experience or NA...' },
      { 
        id: 'hf10', 
        name: 'proposalDriveUrl', 
        label: "Upload Your Club's Proposal (Google Drive Link)", 
        type: 'text', 
        required: true, 
        placeholder: 'https://drive.google.com/...',
        helperText: "Paste the Google Drive link to your club proposal document or presentation. Please ensure the link sharing permission is set to 'Anyone with the link can view'. The club proposal may contain the motivation/vision, proposed plan for accommodation, local transportation & food, key activities & unique experiences, possible challenges & plan to overcome them." 
      },
    ],
  },
];

export const DEFAULT_SUBMISSIONS: FormSubmissionRecord[] = [];

export function getStoredForms(): FormDefinition[] {
  if (typeof window === 'undefined') return DEFAULT_FORMS;
  try {
    const raw = localStorage.getItem(FORMS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(DEFAULT_FORMS));
      return DEFAULT_FORMS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_FORMS;
  }
}

export function saveStoredForms(forms: FormDefinition[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(forms));
    window.dispatchEvent(new Event('ride_forms_updated'));
  } catch (e) {
    console.error('Failed to save forms to localStorage', e);
  }
}

export function getStoredSubmissions(): FormSubmissionRecord[] {
  if (typeof window === 'undefined') return DEFAULT_SUBMISSIONS;
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(DEFAULT_SUBMISSIONS));
      return DEFAULT_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SUBMISSIONS;
  }
}

export function saveStoredSubmission(submission: Omit<FormSubmissionRecord, 'id' | 'submittedAt'>): FormSubmissionRecord {
  const current = getStoredSubmissions();
  const record: FormSubmissionRecord = {
    ...submission,
    id: 'sub-' + Date.now(),
    submittedAt: new Date().toISOString(),
  };
  const updated = [record, ...current];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('ride_submissions_updated'));
    } catch (e) {
      console.error('Failed to save submission to localStorage', e);
    }
  }
  return record;
}

export function updateStoredSubmissionStatus(
  submissionId: string, 
  status: 'submitted' | 'under_review' | 'approved' | 'declined',
  notes?: string
): void {
  const current = getStoredSubmissions();
  const updated = current.map((s) => (s.id === submissionId ? { ...s, status, notes: notes !== undefined ? notes : s.notes } : s));
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('ride_submissions_updated'));
    } catch (e) {
      console.error('Failed to update submission status in localStorage', e);
    }
  }
}
