import { z } from "zod";

export const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(2).max(50).optional(),
  lastName: z.string().trim().min(2).max(50).optional(),
  email: z.email().trim().toLowerCase().optional(),
  profileImageUrl: z.string().trim().url().optional().nullable(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message:
      "La confirmation du mot de passe doit correspondre au nouveau mot de passe.",
  });

export type ProfileUpdateDto = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
