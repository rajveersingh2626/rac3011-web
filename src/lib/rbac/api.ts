import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import {
  permissionSchema,
  roleSchema,
  userRoleSchema,
  type CreateRoleInput,
  type CreateUserRoleInput,
  type Permission,
  type RoleRecord,
  type UpdateRoleInput,
  type UserRole,
} from './types';

export async function fetchRoles(): Promise<RoleRecord[]> {
  return apiFetch('/roles', { schema: z.array(roleSchema) });
}

export async function fetchPermissions(): Promise<Permission[]> {
  return apiFetch('/permissions', { schema: z.array(permissionSchema) });
}

export async function createRole(input: CreateRoleInput): Promise<RoleRecord> {
  return apiFetch('/roles', { method: 'POST', body: input, schema: roleSchema });
}

export async function updateRole(id: string, input: UpdateRoleInput): Promise<RoleRecord> {
  return apiFetch(`/roles/${encodeURIComponent(id)}`, { method: 'PATCH', body: input, schema: roleSchema });
}

export async function deleteRole(id: string): Promise<void> {
  await apiFetch(`/roles/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function fetchUserRoles(userId?: string): Promise<UserRole[]> {
  const qs = userId ? `?filter[userId]=${encodeURIComponent(userId)}` : '';
  return apiFetch(`/user-roles${qs}`, { schema: z.array(userRoleSchema) });
}

export async function grantUserRole(input: CreateUserRoleInput): Promise<UserRole> {
  return apiFetch('/user-roles', { method: 'POST', body: input, schema: userRoleSchema });
}

export async function revokeUserRole(id: string): Promise<void> {
  await apiFetch(`/user-roles/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function fetchUserDirectory(q?: string): Promise<import('./types').UserDirectoryItem[]> {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  return apiFetch(`/user-roles/directory${qs}`, { schema: z.array(z.custom<import('./types').UserDirectoryItem>()) });
}
