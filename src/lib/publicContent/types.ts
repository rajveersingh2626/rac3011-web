import { z } from 'zod';

export const achievementSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  clubId: z.string().nullable().optional(),
  date: z.string(),
  certificateUrl: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  order: z.number().nullable().optional(),
});
export type Achievement = z.infer<typeof achievementSchema>;

export const partnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  logoUrl: z.string().nullable().optional(),
  tier: z.string().optional().default('General'),
  website: z.string().nullable().optional(),
  permissionStatus: z.string().optional().default('granted'),
  order: z.number().nullable().optional(),
});
export type Partner = z.infer<typeof partnerSchema>;

export const publicationSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  url: z.string(),
  month: z.string(),
  coverUrl: z.string().nullable().optional(),
});
export type Publication = z.infer<typeof publicationSchema>;

export const RESOURCE_CATEGORIES = ['documents', 'forms', 'logos', 'photos', 'guest_kit', 'templates'] as const;
export const resourceSchema = z.object({
  id: z.string(),
  category: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  url: z.string(),
  isLocked: z.boolean().optional().default(false),
  requiredPermission: z.string().nullable().optional(),
  comingSoonMonth: z.string().nullable().optional(),
  order: z.number().nullable().optional(),
});
export type Resource = z.infer<typeof resourceSchema>;

export const pastDrrSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  terms: z.array(z.string()).optional().default([]),
  homeClubId: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  isLowResPhoto: z.boolean().optional().default(false),
  order: z.number().nullable().optional(),
});
export type PastDrr = z.infer<typeof pastDrrSchema>;

export const districtTeamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  designation: z.string(),
  kind: z.string().optional().default('core'),
  photoUrl: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  clubId: z.string().nullable().optional(),
  order: z.number().nullable().optional(),
  ryYear: z.number().nullable().optional(),
});
export type DistrictTeamMember = z.infer<typeof districtTeamMemberSchema>;

export const enquirySchema = z.object({
  id: z.string(),
  kind: z.enum(['new_club', 'sponsor', 'contact']),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  organisation: z.string().nullable(),
  message: z.string(),
  payload: z.unknown().nullable(),
  routedTo: z.string(),
  status: z.string(),
  assignedToId: z.string().nullable(),
  createdAt: z.string(),
});
export type Enquiry = z.infer<typeof enquirySchema>;

export const sisterClubRequestSchema = z.object({
  id: z.string(),
  clubId: z.string(),
  partnerClubName: z.string(),
  partnerDistrict: z.string(),
  country: z.string(),
  contactName: z.string(),
  contactEmail: z.string(),
  status: z.string(),
  signedOn: z.string().nullable(),
  submittedById: z.string().nullable(),
  createdAt: z.string(),
});
export type SisterClubRequest = z.infer<typeof sisterClubRequestSchema>;
