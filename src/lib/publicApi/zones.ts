import { z } from 'zod';
import { apiFetch } from '@/lib/api';

export const zoneSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number(),
});
export type ZoneSummary = z.infer<typeof zoneSummarySchema>;

const zoneListSchema = z.object({ items: z.array(zoneSummarySchema) });

export function fetchZones(): Promise<{ items: ZoneSummary[] }> {
  return apiFetch('/public/zones', { schema: zoneListSchema });
}
