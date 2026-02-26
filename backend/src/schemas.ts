import { z } from "zod";

export const createBinderSchema = z.object({
  name: z.string().min(1).max(200),
});

export const createPageSchema = z.object({
  binderId: z.string().uuid(),
  pageIndex: z.number().int().min(0),
});

export const putSlotSchema = z.object({
  pageId: z.string().uuid(),
  position: z.number().int().min(0).max(8),
  card: z.object({
    id: z.string(),
    name: z.string(),
    imageSmall: z.string().url(),
    imageLarge: z.string().url(),
    setName: z.string(),
    number: z.string(),
    rarity: z.string().optional(),
  }),
});

export type CreateBinderBody = z.infer<typeof createBinderSchema>;
export type CreatePageBody = z.infer<typeof createPageSchema>;
export type PutSlotBody = z.infer<typeof putSlotSchema>;
