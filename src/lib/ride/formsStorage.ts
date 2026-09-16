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
  participantId?: string;
  participantName: string;
  participantEmail: string;
  homeDistrict: string;
  values: Record<string, any>;
  submittedAt: string;
}

const FORMS_STORAGE_KEY = 'rac3011_ride_forms_v1';
const SUBMISSIONS_STORAGE_KEY = 'rac3011_ride_submissions_v1';

export const DEFAULT_FORMS: FormDefinition[] = [
  {
    id: 'form-1',
    slug: 'delegate-pass-2026',
    title: 'Official Delegate Registration (DMJ 2026)',
    description: 'Primary registration intake schema for outstation and international delegates traveling to Delhi NCR.',
    version: 1,
    isActive: true,
    isPublic: true,
    createdAt: '2026-08-15',
    fields: [
      { id: 'f1', name: 'fullName', label: 'Full Legal Name', type: 'text', required: true, placeholder: 'e.g. Rtr. Rohan Malhotra' },
      { id: 'f2', name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'rohan@example.com' },
      { id: 'f3', name: 'phone', label: 'WhatsApp / Mobile Number', type: 'phone', required: true, placeholder: '+91 98765 43210' },
      { id: 'f4', name: 'homeDistrict', label: 'Home Rotary District', type: 'text', required: true, placeholder: 'e.g. 3141' },
      { id: 'f5', name: 'homeClubName', label: 'Home Rotaract Club', type: 'text', required: true, placeholder: 'e.g. RAC Bombay Midtown' },
      { id: 'f6', name: 'dietaryPref', label: 'Dietary Preference', type: 'select', required: true, options: ['Vegetarian', 'Jain', 'Non-Vegetarian', 'Vegan'] },
      { id: 'f7', name: 'arrivalAt', label: 'Expected Arrival Date & Time', type: 'date', required: true },
      { id: 'f8', name: 'arrivalMode', label: 'Mode of Travel', type: 'select', required: true, options: ['Flight (IGI Airport)', 'Train (New Delhi / Hazrat Nizamuddin)', 'Bus / Inter-state Road', 'Private Car'] },
      { id: 'f9', name: 'emergencyContact', label: 'Emergency Contact Name & Phone', type: 'text', required: true, placeholder: 'Parent / Sponsoring Club President' },
    ],
  },
  {
    id: 'form-2',
    slug: 'homestay-allocation-preference',
    title: 'Homestay & Hospitality Allocation Preferences',
    description: 'Supplemental form for delegates requesting specific host club placements or dietary accommodations.',
    version: 1,
    isActive: true,
    isPublic: true,
    createdAt: '2026-08-20',
    fields: [
      { id: 'hf1', name: 'passRef', label: 'Delegate Pass Reference ID', type: 'text', required: true, placeholder: 'DMJ-XXXXXX' },
      { id: 'hf2', name: 'hostPreferenceZone', label: 'Preferred Delhi NCR Zone', type: 'select', required: false, options: ['Zone Prithvi (North/East)', 'Zone Agni (Central/West)', 'Zone Vayu (South Delhi/Noida)', 'Zone Akash (Gurgaon)'] },
      { id: 'hf3', name: 'petAllergies', label: 'Do you have pet allergies?', type: 'select', required: true, options: ['No allergies', 'Allergic to Dogs', 'Allergic to Cats', 'Severe pet dander allergy'] },
      { id: 'hf4', name: 'specialNeeds', label: 'Special Hospitality or Accessibility Requests', type: 'textarea', required: false, placeholder: 'Any accessibility or medical needs...' },
    ],
  },
  {
    id: 'form-3',
    slug: 'cultural-night-audition',
    title: 'Cultural Night & DJ Gala Performer Application',
    description: 'Sign up for solo or club group performances representing regional culture during Delhi Meri Jaan.',
    version: 2,
    isActive: true,
    isPublic: true,
    createdAt: '2026-09-01',
    fields: [
      { id: 'cf1', name: 'actTitle', label: 'Performance Act Title', type: 'text', required: true, placeholder: 'e.g. Bhangra Fusion / Classical Sitar' },
      { id: 'cf2', name: 'performerCount', label: 'Total Number of Performers', type: 'number', required: true, placeholder: '1-8' },
      { id: 'cf3', name: 'audioTrackUrl', label: 'Audio Track Link (Google Drive / SoundCloud)', type: 'text', required: true, placeholder: 'https://...' },
      { id: 'cf4', name: 'specialEquipment', label: 'Stage Equipment / Mic Requirements', type: 'textarea', required: false },
    ],
  },
];

export const DEFAULT_SUBMISSIONS: FormSubmissionRecord[] = [
  {
    id: 'sub-1',
    formId: 'form-2',
    formTitle: 'Homestay & Hospitality Allocation Preferences',
    participantId: 'p-1',
    participantName: 'Rtr. Rohan Malhotra',
    participantEmail: 'rohan.m@rotaract3141.org',
    homeDistrict: '3141',
    values: {
      passRef: 'DMJ-902144',
      hostPreferenceZone: 'Zone Vayu (South Delhi/Noida)',
      petAllergies: 'No allergies',
      specialNeeds: 'Requires early morning vegetarian breakfast before district transit bus departure.',
    },
    submittedAt: '2026-09-14T11:20:00Z',
  },
  {
    id: 'sub-2',
    formId: 'form-3',
    formTitle: 'Cultural Night & DJ Gala Performer Application',
    participantId: 'p-2',
    participantName: 'Rtr. Ananya Sharma',
    participantEmail: 'ananya.s@rotaract3190.org',
    homeDistrict: '3190',
    values: {
      actTitle: 'Classical Kathak Jugalbandi',
      performerCount: '3',
      audioTrackUrl: 'https://drive.google.com/file/d/1exampleAudioTrack',
      specialEquipment: 'Two wireless boundary mics and monitor speakers near center stage.',
    },
    submittedAt: '2026-09-15T15:45:00Z',
  },
];

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
