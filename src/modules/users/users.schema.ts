import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
  email: z.email().trim().toLowerCase(),
  roleId: z.number().int().positive(),
  profileImageUrl: z.url().optional(),
  organizationId: z.number().int().positive().optional(),
});

export const updateUserSchema = createUserSchema.partial().extend({
  isActive: z.boolean().optional(),
  isLocked: z.boolean().optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
