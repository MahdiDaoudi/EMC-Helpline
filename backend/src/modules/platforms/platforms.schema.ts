import { z } from "zod";

export const createPlatformSchema = z.object({
  name: z.string().trim(),
  email: z.email().trim(),
  icon: z.string().trim().max(255).optional().nullable(),
});

export const updatePlatformSchema = createPlatformSchema.partial();

export type CreatePlatformDto = z.infer<typeof createPlatformSchema>;
export type UpdatePlatformDto = z.infer<typeof updatePlatformSchema>;
