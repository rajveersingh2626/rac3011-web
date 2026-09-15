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

export async function fetchActiveSessions(): Promise<ActiveSession[]> {
  return apiFetch<ActiveSession[]>('/auth/sessions');
}

export async function revokeSession(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/auth/sessions/${id}`, {
    method: 'DELETE',
  });
}

export async function revokeUserSessions(userId: string): Promise<{ count: number }> {
  return apiFetch<{ count: number }>(`/auth/sessions/revoke-user/${userId}`, {
    method: 'POST',
  });
}

export async function revokeAllSessions(): Promise<{ count: number }> {
  return apiFetch<{ count: number }>('/auth/sessions/revoke-all', {
    method: 'POST',
  });
}
