import { z } from "zod";

export const createValidateSchema = z.object({

});

export const updateValidateSchema = createValidateSchema.partial();

export type CreateValidateDto = z.infer<typeof createValidateSchema>;
export type UpdateValidateDto = z.infer<typeof updateValidateSchema>;