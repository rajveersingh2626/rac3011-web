import { apiFetch } from '@/lib/api';

export type RideFormFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'link'
  | 'radio'
  | 'file'
  | 'multiselect';

export interface RideFormFieldDefinition {
  id: string;
  name: string;
  label: string;
  type: RideFormFieldType | string;
  required: boolean;
  placeholder?: string;
  helperText?: string;
  options?: string[];
}

export interface RideFormItem {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  category: string;
  status: 'draft' | 'published' | 'archived';
  targetRoles: string[];
  fields: RideFormFieldDefinition[];
  isActive: boolean;
  isPublic: boolean;
  version: number;
  submissionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RideFormSubmissionItem {
  id: string;
  formId: string;
  participantId: string;
  participant: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    homeDistrict: string;
    homeClubName: string;
    participantType: string;
    status: string;
    approvalStatus: string;
  };
  status: 'submitted' | 'under_review' | 'approved' | 'declined';
  reviewNotes?: string | null;
  reviewedAt?: string | null;
  values: Record<string, any>;
  createdAt: string;
}

export interface RideParticipantActiveFormItem extends RideFormItem {
  hasSubmitted: boolean;
  mySubmission?: {
    id: string;
    values: Record<string, any>;
    createdAt: string;
  } | null;
}

export interface CreateRideFormInput {
  title: string;
  slug: string;
  description?: string;
  category?: string;
  status?: 'draft' | 'published' | 'archived';
  targetRoles?: string[];
  fields: RideFormFieldDefinition[];
  isActive?: boolean;
  isPublic?: boolean;
}

export interface UpdateRideFormInput {
  title?: string;
  slug?: string;
  description?: string;
  category?: string;
  status?: 'draft' | 'published' | 'archived';
  targetRoles?: string[];
  fields?: RideFormFieldDefinition[];
  isActive?: boolean;
  isPublic?: boolean;
}

// ==========================================
// ADMIN API CLIENT CALLS
// ==========================================

export async function fetchRideAdminForms(): Promise<RideFormItem[]> {
  const res = await apiFetch<RideFormItem[]>('/ride/forms');
  return Array.isArray(res) ? res : [];
}

export async function fetchRideAdminForm(id: string): Promise<RideFormItem> {
  return apiFetch<RideFormItem>(`/ride/forms/${id}`);
}

export async function createRideAdminForm(data: CreateRideFormInput): Promise<RideFormItem> {
  return apiFetch<RideFormItem>('/ride/forms', {
    method: 'POST',
    body: data,
  });
}

export async function updateRideAdminForm(id: string, data: UpdateRideFormInput): Promise<RideFormItem> {
  return apiFetch<RideFormItem>(`/ride/forms/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function deleteRideAdminForm(id: string): Promise<{ success: boolean; id: string }> {
  return apiFetch<{ success: boolean; id: string }>(`/ride/forms/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchRideFormSubmissions(
  formId: string,
  status?: string,
): Promise<RideFormSubmissionItem[]> {
  const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
  const res = await apiFetch<RideFormSubmissionItem[]>(`/ride/forms/${formId}/submissions${query}`);
  return Array.isArray(res) ? res : [];
}

export async function updateRideSubmissionStatus(
  formId: string,
  subId: string,
  status: 'submitted' | 'under_review' | 'approved' | 'declined',
  notes?: string,
): Promise<any> {
  return apiFetch<any>(`/ride/forms/${formId}/submissions/${subId}/status`, {
    method: 'PATCH',
    body: { status, notes },
  });
}

// ==========================================
// PARTICIPANT API CLIENT CALLS
// ==========================================

export async function fetchParticipantActiveForms(): Promise<RideParticipantActiveFormItem[]> {
  const res = await apiFetch<RideParticipantActiveFormItem[]>('/ride/participant/forms/active');
  return Array.isArray(res) ? res : [];
}

export async function submitParticipantForm(
  formId: string,
  values: Record<string, any>,
): Promise<any> {
  return apiFetch<any>(`/ride/participant/forms/${formId}/submit`, {
    method: 'POST',
    body: { values },
  });
}
