import { apiFetch } from '@/lib/api';

export interface ActiveSession {
  id: string;
  userId: string;
  name: string;
  email: string;
  rotaryId: string | null;
  clubName: string | null;
  roles: string[];
  ipAddress: string | null;
  userAgent: string | null;
  device: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export async function fetchActiveSessions(scope?: string): Promise<ActiveSession[]> {
  const qs = scope ? `?scope=${encodeURIComponent(scope)}` : '';
  return apiFetch<ActiveSession[]>(`/admin/sessions${qs}`);
}

export async function revokeSession(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/admin/sessions/${id}`, {
    method: 'DELETE',
  });
}

export async function revokeUserSessions(userId: string): Promise<{ count: number }> {
  return apiFetch<{ count: number }>(`/admin/sessions/revoke-user/${userId}`, {
    method: 'POST',
  });
}

export async function revokeAllSessions(scope?: string): Promise<{ count: number }> {
  const qs = scope ? `?scope=${encodeURIComponent(scope)}` : '';
  return apiFetch<{ count: number }>(`/admin/sessions/revoke-all${qs}`, {
    method: 'POST',
  });
}
