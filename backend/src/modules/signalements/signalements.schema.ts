import { z } from "zod";
import {
  AccompanimentType,
  ContentType,
  Priority,
  SignalementStatus,
  Titulaire,
} from "../../generated/prisma/enums";
import { createVictimSchema } from "../victims/victims.schema";

const createScreenshotSchema = z.object({
  imageUrl: z.string().trim().min(1).optional(),
  storagePath: z.string().trim().min(1).nullable().optional(),
  publicId: z.string().trim().min(1).nullable().optional(),
});

const createReportedItemSchema = z.object({
  description: z.string().trim().optional(),
  contentUrl: z.url().trim(),
  type: z.enum(ContentType),
  screenshots: z.array(createScreenshotSchema).max(2),
  platformId: z.number().positive(),
});

export const createSignalementSchema = z
  .object({
    description: z.string().trim().optional(),
    titulaire: z.enum(Titulaire).optional().default("MOI_MEME"),
    accompanimentTypes: z
      .array(z.enum(AccompanimentType))
      .optional()
      .default([]),
    otherCyberViolence: z.string().trim().optional(),
    victimId: z.number().int().positive().optional(),
    cyberViolenceId: z.number().int().positive().optional(),
    victim: createVictimSchema.optional(),
    reportedItems: z.array(createReportedItemSchema).min(1).max(5),
  })
  .refine(
    (data) => {
      return !(Boolean(data.victim) && Boolean(data.victimId));
    },
    {
      message: "Provide either victimId or victim, not both.",
    },
  );

export const updateSignalementSchema = z.object({
  description: z.string().trim().optional(),
  titulaire: z.enum(Titulaire).optional(),
  accompanimentTypes: z.array(z.enum(AccompanimentType)).optional(),
  status: z.enum(SignalementStatus).optional(),
  priority: z.enum(Priority).optional(),
  dateAnalyse: z.string().datetime({ offset: true }).nullable().optional(),
  reason: z.string().trim().optional(),
});

export type CreateSignalementDto = z.infer<typeof createSignalementSchema>;
export type UpdateSignalementDto = z.infer<typeof updateSignalementSchema>;
