import { z } from "zod";
import { AssignmentStatus, AccompanimentType } from "../../generated/prisma/enums";

export const createAssignedToSchema = z.object({
  signalementId: z.number().int().positive(),
  organizationId: z.number().int().positive(),
  type: z.enum(AccompanimentType).optional(),
  status: z.enum(AssignmentStatus).optional().default("ASSIGNED"),
  reason: z.string().trim().min(3).optional(),
});

export const updateAssignedToSchema = z.object({
  status: z.enum(AssignmentStatus).optional(),
  reason: z.string().trim().min(5).optional(),
});

export type CreateAssignedToDto = z.infer<typeof createAssignedToSchema>;
export type UpdateAssignedToDto = z.infer<typeof updateAssignedToSchema>;
