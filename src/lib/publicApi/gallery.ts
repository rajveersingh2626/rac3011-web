import { z } from 'zod';
import { apiFetch } from '@/lib/api';

export const publicGalleryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  eventName: z.string().nullable().optional(),
  category: z.string().default('District Events'),
  imageUrl: z.string(),
  caption: z.string().nullable().optional(),
  date: z.string(),
  order: z.number().nullable().optional(),
});
export type PublicGalleryItem = z.infer<typeof publicGalleryItemSchema>;

const listSchema = z.object({ items: z.array(publicGalleryItemSchema) });

export function fetchGalleryItems(): Promise<{ items: PublicGalleryItem[] }> {
  return apiFetch('/public/gallery', { schema: listSchema });
}
