import { z } from 'zod';

export const ANNOUNCEMENT_CHANNELS = ['portal', 'email', 'push'] as const;
export type AnnouncementChannel = (typeof ANNOUNCEMENT_CHANNELS)[number];

export const audienceSchema = z.object({
  roleKeys: z.array(z.string()).optional(),
  zoneIds: z.array(z.string()).optional(),
  clubIds: z.array(z.string()).optional(),
  memberIds: z.array(z.string()).optional(),
});
export type Audience = z.infer<typeof audienceSchema>;

export const announcementSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  audience: audienceSchema,
  channels: z.array(z.enum(ANNOUNCEMENT_CHANNELS)),
  sentAt: z.string().nullable(),
  recipientCount: z.number().nullable(),
  createdById: z.string(),
  createdAt: z.string(),
});
export type Announcement = z.infer<typeof announcementSchema>;

export function paginatedSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({ items: z.array(item), total: z.number(), page: z.number(), pageSize: z.number() });
}

// The audience resolver only checks roleKeys/scopeType — a fixed, low-churn set matching
// prisma/seed/roles.ts's non-project roles. Not fetched from /roles: that endpoint requires
// roles:manage, which most senders (presidents, secretaries, ZRRs) don't hold.
export const SENDABLE_ROLE_KEYS = [
  { key: 'member', label: 'Members' },
  { key: 'president', label: 'Presidents' },
  { key: 'secretary', label: 'Secretaries' },
  { key: 'zrr', label: 'Zonal Rotaract Representatives' },
  { key: 'dsc', label: 'District Secretariat / Council' },
] as const;
