import { z } from "zod";

export const createAssignedToSchema = z.object({

});

export const updateAssignedToSchema = createAssignedToSchema.partial();

export type CreateAssignedToDto = z.infer<typeof createAssignedToSchema>;
export type UpdateAssignedToDto = z.infer<typeof updateAssignedToSchema>;