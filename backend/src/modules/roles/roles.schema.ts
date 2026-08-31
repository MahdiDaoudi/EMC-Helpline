import { z } from "zod";

export const createRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom du rôle est obligatoire.")
    .max(50, "Le nom du rôle ne doit pas dépasser 50 caractères."),
  description: z
    .string()
    .trim()
    .min(5, "La description doit contenir au moins 5 caractères."),
});

export const updateRoleSchema = createRoleSchema.partial();

export type CreateRoleDto = z.infer<typeof createRoleSchema>;
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;