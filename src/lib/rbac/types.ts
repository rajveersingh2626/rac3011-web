import { z } from 'zod';

export const scopeTypeSchema = z.enum(['none', 'club', 'zone', 'project']);
export type ScopeType = z.infer<typeof scopeTypeSchema>;

export const roleSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isSystem: z.boolean(),
  scopeType: scopeTypeSchema,
  permissionKeys: z.array(z.string()),
});
export type RoleRecord = z.infer<typeof roleSchema>;

export const permissionSchema = z.object({
  key: z.string(),
  description: z.string(),
});
export type Permission = z.infer<typeof permissionSchema>;

// Mirrors the API's createRoleSchema key regex, catching a bad key before a round trip.
export const ROLE_KEY_PATTERN = /^[a-z][a-z0-9_]*$/;

export interface CreateRoleInput {
  key: string;
  name: string;
  description?: string;
  scopeType: ScopeType;
  permissionKeys: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string | null;
  scopeType?: ScopeType;
  permissionKeys?: string[];
}

export const userRoleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  roleId: z.string(),
  roleKey: z.string(),
  scopeType: scopeTypeSchema,
  scopeId: z.string().nullable(),
  grantedById: z.string().nullable(),
  createdAt: z.string(),
});
export type UserRole = z.infer<typeof userRoleSchema>;

export interface CreateUserRoleInput {
  userId: string;
  roleId: string;
  scopeType: ScopeType;
  scopeId?: string;
}

export interface UserDirectoryProfile {
  id: string;
  fullName: string;
  status: string;
  clubId: string;
  clubName: string;
  clubShortName: string | null;
  phone: string | null;
  rotaryId: string | null;
  photoUrl: string | null;
}

export interface UserDirectoryRole {
  id: string;
  roleId: string;
  roleKey: string;
  roleName: string;
  scopeType: ScopeType;
  scopeId: string | null;
  grantedById: string | null;
  permissions: string[];
}

export interface UserDirectoryItem {
  id: string;
  name: string;
  email: string;
  profile: UserDirectoryProfile | null;
  roles: UserDirectoryRole[];
  createdAt: string;
}
