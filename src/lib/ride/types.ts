import { z } from 'zod';

export const clubRefSchema = z.object({ id: z.string(), name: z.string(), shortName: z.string().nullable() });
export type ClubRef = z.infer<typeof clubRefSchema>;

export const delegationStatusSchema = z.enum(['planned', 'confirmed', 'completed', 'cancelled']);
export type DelegationStatus = z.infer<typeof delegationStatusSchema>;

export const supportClubSchema = z.object({
  id: z.string(),
  ryYear: z.number(),
  club: clubRefSchema,
  capacityDelegates: z.number(),
  homestayAvailable: z.boolean(),
  preferredMonths: z.array(z.number()),
  contactMemberId: z.string().nullable(),
  contactPhone: z.string(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type SupportClub = z.infer<typeof supportClubSchema>;

export const delegationHostSchema = z.object({
  id: z.string(),
  club: clubRefSchema,
  daysHosted: z.number(),
  membersSent: z.number(),
});
export type DelegationHost = z.infer<typeof delegationHostSchema>;

export const delegationParticipantSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  rotaryId: z.string().nullable().optional(),
  homeDistrict: z.string().optional(),
  status: z.string(),
  approvalStatus: z.string(),
  hostClubId: z.string().nullable().optional(),
  hostFamilyName: z.string().nullable().optional(),
  hostFamilyPhone: z.string().nullable().optional(),
  hostAddress: z.string().nullable().optional(),
});
export type DelegationParticipant = z.infer<typeof delegationParticipantSchema>;

export const approvedHostClubSchema = z.object({
  id: z.string(),
  clubId: z.string(),
  club: clubRefSchema,
  applicantName: z.string(),
  applicantEmail: z.string(),
  applicantPhone: z.string(),
  zone: z.string().optional().default(''),
  capacityDelegates: z.number().default(10),
  homestayAvailable: z.boolean().default(true),
  proposalDriveUrl: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.string().default('approved'),
  submittedAt: z.string().optional(),
});
export type ApprovedHostClub = z.infer<typeof approvedHostClubSchema>;

export const delegationSchema = z.object({
  id: z.string(),
  ryYear: z.number(),
  visitingDistrict: z.string(),
  country: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  headcount: z.number(),
  contactName: z.string(),
  contactEmail: z.string().nullable(),
  status: delegationStatusSchema,
  hosts: z.array(delegationHostSchema),
  participants: z.array(delegationParticipantSchema).optional().default([]),
  approvedParticipantsCount: z.number().optional().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Delegation = z.infer<typeof delegationSchema>;

export const galleryItemKindSchema = z.enum(['photo', 'video']);
export type GalleryItemKind = z.infer<typeof galleryItemKindSchema>;

export const galleryItemSchema = z.object({
  id: z.string(),
  year: z.number(),
  url: z.string(),
  kind: galleryItemKindSchema,
  caption: z.string().nullable(),
  headingLeft: z.string().nullable().optional(),
  headingRight: z.string().nullable().optional(),
  order: z.number(),
  createdAt: z.string(),
});
export type GalleryItem = z.infer<typeof galleryItemSchema>;

export function paginatedSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({ items: z.array(item), total: z.number(), page: z.number(), pageSize: z.number() });
}

export const rideResourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  scope: z.string(),
  targetClubName: z.string().nullable().optional(),
  targetMemberEmail: z.string().nullable().optional(),
  targetDistrict: z.string().nullable().optional(),
  driveUrl: z.string(),
  description: z.string().nullable().optional(),
  order: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type RideResource = z.infer<typeof rideResourceSchema>;

export const rideAnnouncementSchema = z.object({
  id: z.string(),
  subject: z.string(),
  body: z.string(),
  sender: z.string(),
  audienceScope: z.string(),
  targetDistricts: z.array(z.string()).optional(),
  targetEmails: z.array(z.string()).optional(),
  hostClubsOnly: z.boolean().optional(),
  recipientCount: z.number(),
  createdAt: z.string(),
});
export type RideAnnouncement = z.infer<typeof rideAnnouncementSchema>;
