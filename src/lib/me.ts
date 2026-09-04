import { z } from 'zod';

export const scopeSchema = z.object({
  type: z.enum(['none', 'club', 'zone', 'project']),
  id: z.string().optional(),
});
export type Scope = z.infer<typeof scopeSchema>;

export const meSchema = z.object({
  user: z.object({ id: z.string(), name: z.string(), email: z.string(), twoFactorEnabled: z.boolean() }),
  profile: z
    .object({
      id: z.string().optional(),
      clubId: z.string().nullable().optional(),
      photoUrl: z.string().nullable().optional(),
      themePreference: z.enum(['light', 'dark', 'system']).nullable().optional(),
    })
    .passthrough()
    .nullable(),
  roles: z.array(z.object({ roleKey: z.string(), scope: scopeSchema })),
  grants: z.record(z.string(), z.array(scopeSchema)),
  clubs: z.array(z.object({ id: z.string(), name: z.string(), shortName: z.string(), zoneId: z.string().nullable() })),
  theme: z.enum(['light', 'dark', 'system']).nullable().optional(),
});
export type Me = z.infer<typeof meSchema>;
