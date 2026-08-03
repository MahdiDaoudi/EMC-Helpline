import { z } from "zod";

export const createOrganizationSchema = z.object({
    
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export type CreateOrganizationDto = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationDto = z.infer<typeof updateOrganizationSchema>;