import { z } from "zod";
import { PlatformReportStatus } from "../../generated/prisma/enums";

export const createPlatformReportSchema = z.object({
  emailSubject: z.string().trim().min(2),
  emailBody: z.string().trim().min(5),
  emailTo: z.string().trim().email().min(5),
  selectedScreenshotUrls: z
    .array(z.string().trim())
    .optional()
    .default([]),
  selectedLinks: z
    .array(z.string().trim())
    .optional()
    .default([]),
  signalementId: z.number().positive(),
  platformId: z.number().int().positive(),
});

export const updatePlatformReportSchema = z.object({
  closedAt: z.string().datetime().optional(),
  status: z.enum(PlatformReportStatus).optional(),
});

export type CreatePlatformReportDto = z.infer<
  typeof createPlatformReportSchema
>;
export type UpdatePlatformReportDto = z.infer<
  typeof updatePlatformReportSchema
>;
