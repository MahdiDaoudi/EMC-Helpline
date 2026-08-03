import { z } from "zod";

export const createScreenshotSchema = z.object({

});

export const updateScreenshotSchema = createScreenshotSchema.partial();

export type CreateScreenshotDto = z.infer<typeof createScreenshotSchema>;
export type UpdateScreenshotDto = z.infer<typeof updateScreenshotSchema>;