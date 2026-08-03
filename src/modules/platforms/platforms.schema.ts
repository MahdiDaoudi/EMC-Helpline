import { z } from "zod";

export const createPlatformSchema = z.object({

});

export const updatePlatformSchema = createPlatformSchema.partial();

export type CreatePlatformDto = z.infer<typeof createPlatformSchema>;
export type UpdatePlatformDto = z.infer<typeof updatePlatformSchema>;