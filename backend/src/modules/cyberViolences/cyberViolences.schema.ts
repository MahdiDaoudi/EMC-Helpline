import { z } from "zod";

export const createCyberViolenceSchema = z.object({
    name : z.string().min(5)
});

export const updateCyberViolenceSchema = createCyberViolenceSchema;

export type CreateCyberViolenceDto = z.infer<typeof createCyberViolenceSchema>;
export type UpdateCyberViolenceDto = z.infer<typeof updateCyberViolenceSchema>;