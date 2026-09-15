import { z } from 'zod';

export const auditRowSchema = z.object({
  id: z.string(),
  actorId: z.string().nullable(),
  actorName: z.string().nullable().optional(),
  actorEmail: z.string().nullable().optional(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string().nullable(),
  before: z.unknown(),
  after: z.unknown(),
  at: z.string(),
});
export type AuditRow = z.infer<typeof auditRowSchema>;

export function paginatedSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({ items: z.array(item), total: z.number(), page: z.number(), pageSize: z.number() });
}
