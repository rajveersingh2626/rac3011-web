import { apiFetch } from '@/lib/api';

export type FormFieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'link';

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

export interface CustomFormItem {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  category?: string | null;
  status: 'draft' | 'published' | 'archived';
  accessMode: 'all' | 'specific' | 'none';
  targetSurface: string;
  targetRoles: string[];
  targetClubIds: string[];
  fields: FormFieldDefinition[];
  isPublic: boolean;
  submissionCount?: number;
  statusCounts?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveDashboardFormItem extends CustomFormItem {
  mySubmission?: CustomFormSubmissionItem | null;
  hasSubmitted: boolean;
}

export interface CustomFormSubmissionItem {
  id: string;
  formId: string;
  userId?: string | null;
  applicantName?: string | null;
  applicantEmail?: string | null;
  applicantPhone?: string | null;
  clubId?: string | null;
  clubName?: string | null;
  status: 'submitted' | 'under_review' | 'approved' | 'declined';
  values: Record<string, any>;
  notes?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  submittedAt: string;
  updatedAt: string;
}

export async function fetchAdminForms(): Promise<CustomFormItem[]> {
  return apiFetch<CustomFormItem[]>('/forms');
}

export async function fetchAdminForm(id: string): Promise<CustomFormItem> {
  return apiFetch<CustomFormItem>(`/forms/${id}`);
}

export async function createAdminForm(body: Partial<CustomFormItem>): Promise<CustomFormItem> {
  return apiFetch<CustomFormItem>('/forms', {
    method: 'POST',
    body,
  });
}

export async function updateAdminForm(id: string, body: Partial<CustomFormItem>): Promise<CustomFormItem> {
  return apiFetch<CustomFormItem>(`/forms/${id}`, {
    method: 'PATCH',
    body,
  });
}

export async function deleteAdminForm(id: string): Promise<void> {
  await apiFetch(`/forms/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchDashboardActiveForms(): Promise<ActiveDashboardFormItem[]> {
  return apiFetch<ActiveDashboardFormItem[]>('/forms/dashboard-active');
}

export async function submitCustomForm(
  formIdOrSlug: string,
  body: {
    applicantName?: string;
    applicantEmail?: string;
    applicantPhone?: string;
    clubId?: string;
    clubName?: string;
    values: Record<string, any>;
  },
): Promise<CustomFormSubmissionItem> {
  return apiFetch<CustomFormSubmissionItem>(`/forms/${encodeURIComponent(formIdOrSlug)}/submit`, {
    method: 'POST',
    body,
  });
}

export async function fetchFormSubmissions(
  formId: string,
  filters?: { status?: string; search?: string },
): Promise<CustomFormSubmissionItem[]> {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<CustomFormSubmissionItem[]>(`/forms/${encodeURIComponent(formId)}/submissions${qs}`);
}

export async function updateSubmissionReviewStatus(
  formId: string,
  submissionId: string,
  status: 'submitted' | 'under_review' | 'approved' | 'declined',
  notes?: string | null,
): Promise<CustomFormSubmissionItem> {
  return apiFetch<CustomFormSubmissionItem>(
    `/forms/${encodeURIComponent(formId)}/submissions/${encodeURIComponent(submissionId)}/status`,
    {
      method: 'PATCH',
      body: { status, notes },
    },
  );
}
