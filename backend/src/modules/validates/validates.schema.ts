import { z } from "zod";
import { ValidationStatus, ValidationType } from "../../generated/prisma/enums";

export const createValidateSchema = z.object({
    type: z.enum(ValidationType),
    status: z.enum(ValidationStatus),
    reason: z.string().trim().min(4)
});

export const updateValidateSchema = createValidateSchema.partial();

export type CreateValidateDto = z.infer<typeof createValidateSchema>;
export type UpdateValidateDto = z.infer<typeof updateValidateSchema>;