import { z } from "zod";

export const createPlatformReportSchema = z.object({

});

export const updatePlatformReportSchema = createPlatformReportSchema.partial();

export type CreatePlatformReportDto = z.infer<typeof createPlatformReportSchema>;
export type UpdatePlatformReportDto = z.infer<typeof updatePlatformReportSchema>;