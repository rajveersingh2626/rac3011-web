import { z } from 'zod';
import { apiFetch } from '@/lib/api';

export const achievementSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  clubId: z.string().nullable().optional(),
  date: z.string(),
  certificateUrl: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});
export type Achievement = z.infer<typeof achievementSchema>;

const listSchema = z.object({ items: z.array(achievementSchema) });

export function fetchAchievements(): Promise<{ items: Achievement[] }> {
  return apiFetch('/public/achievements', { schema: listSchema });
}
