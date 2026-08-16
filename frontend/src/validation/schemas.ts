import { z } from "zod";

export const userBaseSchema = z.object({
  firstName: z.string().trim().min(2, {
    message:
      "Le prénom est obligatoire et doit contenir au moins 2 caractères.",
  }),
  lastName: z.string().trim().min(2, {
    message: "Le nom est obligatoire et doit contenir au moins 2 caractères.",
  }),
  email: z
    .string()
    .trim()
    .email({ message: "Veuillez saisir une adresse e-mail valide." }),
  roleId: z.number().int().positive({ message: "Le rôle est obligatoire." }),
  organizationId: z.number().int().nonnegative().optional(),
});

export const userCreateSchema = userBaseSchema;
export const userUpdateSchema = userBaseSchema.partial().extend({
  isActive: z.boolean().optional(),
  isLocked: z.boolean().optional(),
});

export const organizationSchema = z.object({
  nickname: z.string().trim().min(2, { message: "Le surnom est obligatoire." }),
  name: z
    .string()
    .trim()
    .min(2, { message: "Le nom officiel est obligatoire." }),
  category: z.enum(["JURIDIQUE", "PSYCHIQUE"], {
    message: "La catégorie est obligatoire.",
  }),
  email: z
    .string()
    .trim()
    .email({ message: "Veuillez saisir une adresse e-mail valide." }),
  website: z
    .string()
    .trim()
    .url({ message: "Veuillez saisir une URL valide." })
    .optional()
    .or(z.literal(""))
    .optional(),
  description: z.string().max(1000).optional().or(z.literal("")),
});

export const platformSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Le nom de la plateforme est obligatoire." }),
  email: z
    .string()
    .trim()
    .email({ message: "Veuillez saisir une adresse e-mail valide." }),
  icon: z.string().trim().optional().or(z.literal("")),
});

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, { message: "Le prénom est obligatoire." }),
  lastName: z.string().trim().min(2, { message: "Le nom est obligatoire." }),
  email: z
    .string()
    .trim()
    .email({ message: "Veuillez saisir une adresse e-mail valide." }),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Le mot de passe actuel est obligatoire." }),
    newPassword: z.string().min(8, {
      message: "Le nouveau mot de passe doit contenir au moins 8 caractères.",
    }),
    confirmPassword: z
      .string()
      .min(1, { message: "La confirmation du mot de passe est requise." }),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas.",
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    path: ["newPassword"],
    message:
      "Le nouveau mot de passe doit être différent du mot de passe actuel.",
  });

export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type OrganizationDto = z.infer<typeof organizationSchema>;
export type PlatformDto = z.infer<typeof platformSchema>;
export type ProfileDto = z.infer<typeof profileSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
