import { z } from 'zod';

export const projectStatusSchema = z.enum(['draft', 'submitted', 'published', 'rejected']);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const projectClubRefSchema = z.object({
  role: z.enum(['lead', 'collaborator']),
  club: z.object({ id: z.string(), name: z.string(), shortName: z.string().nullable(), slug: z.string().nullable() }),
});
export type ProjectClubRef = z.infer<typeof projectClubRefSchema>;

export const projectSchema = z.object({
  id: z.string(),
  slug: z.string().nullable(),
  title: z.string(),
  category: z.string().default(''),
  avenueOfService: z.string().nullable().optional(),
  areasOfFocus: z.array(z.string()).default([]),
  date: z.string(),
  summary: z.string(),
  body: z.string().nullable(),
  beneficiaries: z.number().nullable(),
  photos: z.array(z.string()),
  submittedById: z.string().nullable(),
  status: projectStatusSchema,
  consentConfirmed: z.boolean(),
  submittedAt: z.string().nullable(),
  publishedTitle: z.string().nullable(),
  publishedSummary: z.string().nullable(),
  publishedBody: z.string().nullable(),
  editorNotes: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  publishedAt: z.string().nullable(),
  publishedById: z.string().nullable(),
  clubs: z.array(projectClubRefSchema),
});
export type Project = z.infer<typeof projectSchema>;

export function paginatedSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({ items: z.array(item), total: z.number(), page: z.number(), pageSize: z.number() });
}

export const AVENUES_OF_SERVICE = [
  'Community Services',
  'Club Services',
  'International Services',
  'Vocational Services',
  'Youth Services',
] as const;
export type AvenueOfService = (typeof AVENUES_OF_SERVICE)[number];

export const AREAS_OF_FOCUS = [
  'Peacebuilding and Conflict Prevention',
  'Disease Prevention and Treatment',
  'Water, Sanitation, and Hygiene',
  'Maternal and Child Health',
  'Basic Education and Literacy',
  'Community Economic Development',
  'Environment',
  'Other',
  'N/A',
] as const;
export type AreaOfFocus = (typeof AREAS_OF_FOCUS)[number];

export const SHOWCASE_CATEGORIES = AREAS_OF_FOCUS;
