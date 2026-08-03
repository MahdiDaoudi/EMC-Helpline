import { z } from "zod";

export const createCyberViolenceSchema = z.object({

});

export const updateCyberViolenceSchema = createCyberViolenceSchema.partial();

export type CreateCyberViolenceDto = z.infer<typeof createCyberViolenceSchema>;
export type UpdateCyberViolenceDto = z.infer<typeof updateCyberViolenceSchema>;