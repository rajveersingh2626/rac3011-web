import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import {
  delegationSchema,
  galleryItemSchema,
  paginatedSchema,
  supportClubSchema,
  type Delegation,
  type DelegationStatus,
  type GalleryItem,
  type GalleryItemKind,
  type SupportClub,
  type RideResource,
  type RideAnnouncement,
  approvedHostClubSchema,
  type ApprovedHostClub,
} from './types';

export type { RideResource, RideAnnouncement, ApprovedHostClub };

const supportClubsPage = paginatedSchema(supportClubSchema);
const delegationsPage = paginatedSchema(delegationSchema);
const galleryItemsPage = paginatedSchema(galleryItemSchema);

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : '';
}

export interface SupportClubListParams {
  ryYear?: number;
  clubId?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchSupportClubs(params: SupportClubListParams = {}) {
  const qs = query({
    'filter[ryYear]': params.ryYear,
    'filter[clubId]': params.clubId,
    page: params.page,
    pageSize: params.pageSize,
  });
  return apiFetch(`/ride/support-clubs${qs}`, { schema: supportClubsPage });
}

export interface UpsertSupportClubInput {
  clubId?: string;
  ryYear?: number;
  capacityDelegates: number;
  homestayAvailable: boolean;
  preferredMonths?: number[];
  contactMemberId?: string | null;
  contactPhone: string;
  notes?: string | null;
}

export async function upsertSupportClub(input: UpsertSupportClubInput): Promise<SupportClub> {
  return apiFetch('/ride/support-clubs', { method: 'POST', body: input, schema: supportClubSchema });
}

export interface DelegationListParams {
  status?: DelegationStatus;
  ryYear?: number;
  approvedOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export async function fetchDelegations(params: DelegationListParams = {}) {
  const qs = query({
    'filter[status]': params.status,
    'filter[ryYear]': params.ryYear,
    'filter[approvedOnly]': params.approvedOnly ? 'true' : undefined,
    page: params.page,
    pageSize: params.pageSize,
  });
  return apiFetch(`/ride/delegations${qs}`, { schema: delegationsPage });
}

export async function fetchDelegation(id: string): Promise<Delegation> {
  return apiFetch(`/ride/delegations/${encodeURIComponent(id)}`, { schema: delegationSchema });
}

export async function fetchApprovedHostClubs(): Promise<ApprovedHostClub[]> {
  return apiFetch('/ride/delegations/approved-hosts', {
    schema: z.array(approvedHostClubSchema),
  });
}

export interface CreateDelegationInput {
  ryYear: number;
  visitingDistrict: string;
  country: string;
  startsAt: string;
  endsAt: string;
  headcount: number;
  contactName: string;
  contactEmail?: string | null;
  status?: DelegationStatus;
}

export async function createDelegation(input: CreateDelegationInput): Promise<Delegation> {
  return apiFetch('/ride/delegations', { method: 'POST', body: input, schema: delegationSchema });
}

export interface UpdateDelegationInput {
  visitingDistrict?: string;
  country?: string;
  startsAt?: string;
  endsAt?: string;
  headcount?: number;
  contactName?: string;
  contactEmail?: string | null;
  status?: DelegationStatus;
}

export async function updateDelegation(id: string, input: UpdateDelegationInput): Promise<Delegation> {
  return apiFetch(`/ride/delegations/${encodeURIComponent(id)}`, { method: 'PATCH', body: input, schema: delegationSchema });
}

export async function deleteDelegation(id: string): Promise<void> {
  await apiFetch(`/ride/delegations/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export interface HostAssignmentInput {
  clubId: string;
  daysHosted: number;
  membersSent: number;
  hostFamilyName?: string;
  hostFamilyPhone?: string;
  hostAddress?: string;
}

export async function assignHosts(
  id: string,
  hosts: HostAssignmentInput[],
  participantIds?: string[],
): Promise<Delegation> {
  return apiFetch(`/ride/delegations/${encodeURIComponent(id)}/hosts`, {
    method: 'PUT',
    body: { hosts, participantIds },
    schema: delegationSchema,
  });
}

export interface GalleryItemListParams {
  year?: number;
  page?: number;
  pageSize?: number;
}

export async function fetchGalleryItems(params: GalleryItemListParams = {}) {
  const qs = query({ 'filter[year]': params.year, page: params.page, pageSize: params.pageSize });
  return apiFetch(`/ride/gallery-items${qs}`, { schema: galleryItemsPage });
}

export interface CreateGalleryItemInput {
  year: number;
  url: string;
  kind: GalleryItemKind;
  caption?: string | null;
  headingLeft?: string | null;
  headingRight?: string | null;
  order?: number;
}

export async function createGalleryItem(input: CreateGalleryItemInput): Promise<GalleryItem> {
  return apiFetch('/ride/gallery-items', { method: 'POST', body: input, schema: galleryItemSchema });
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await apiFetch(`/ride/gallery-items/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export interface CreateRideResourceInput {
  title: string;
  category: string;
  scope: string;
  targetClubName?: string;
  targetMemberEmail?: string;
  targetDistrict?: string;
  driveUrl: string;
  description?: string;
}

export async function fetchRideResources(params: { category?: string; scope?: string; page?: number; pageSize?: number } = {}) {
  const qs = query({
    'filter[category]': params.category,
    'filter[scope]': params.scope,
    page: params.page,
    pageSize: params.pageSize,
  });
  return apiFetch<{ items: RideResource[]; total: number; page: number; pageSize: number }>(`/ride/resources${qs}`);
}

export async function createRideResource(input: CreateRideResourceInput): Promise<RideResource> {
  return apiFetch('/ride/resources', { method: 'POST', body: input });
}

export async function deleteRideResource(id: string): Promise<void> {
  await apiFetch(`/ride/resources/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function fetchPublicRideResources(params: { email?: string; clubName?: string; district?: string } = {}) {
  const qs = query({
    email: params.email,
    clubName: params.clubName,
    district: params.district,
  });
  return apiFetch<{ items: RideResource[] }>(`/public/ride/resources${qs}`);
}

export async function fetchPublicRideAnnouncements(params: { district?: string; email?: string } = {}) {
  const qs = query({
    district: params.district,
    email: params.email,
  });
  return apiFetch<{ items: RideAnnouncement[] }>(`/public/ride/announcements${qs}`);
}

export async function fetchRideDistricts(): Promise<string[]> {
  const res = await apiFetch<{ districts: string[] }>('/ride/participants/districts');
  return res?.districts || [];
}

export async function resetRideRegistrations(
  confirmation = 'RESET',
  mode: 'soft' | 'hard' = 'hard',
): Promise<{ count: number; mode: 'soft' | 'hard' }> {
  return apiFetch<{ count: number; mode: 'soft' | 'hard' }>('/ride/participants/admin/reset', {
    method: 'POST',
    body: { confirmation, mode },
  });
}

