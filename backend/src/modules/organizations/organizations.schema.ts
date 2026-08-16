import { z } from "zod";
import { OrganizationCategory } from "../../generated/prisma/enums";

export const createOrganizationSchema = z.object({
  nickname: z.string().trim().min(2),
  name: z.string().trim(),
  category: z.enum(OrganizationCategory),
  email: z.email().trim(),
  website: z.preprocess((value) => {
    if (typeof value !== "string" || value.trim() === "") {
      return undefined;
    }
    return value.startsWith("http://") || value.startsWith("https://")
      ? value
      : `https://${value}`;
  }, z.url().optional()),
  description: z.string().trim(),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export type CreateOrganizationDto = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationDto = z.infer<typeof updateOrganizationSchema>;
