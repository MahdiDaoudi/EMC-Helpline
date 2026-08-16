import { boolean, z } from "zod";
import { AgeGroup, Sex } from "../../generated/prisma/enums";

const victimSchema = z.object({
  firstName: z.string().trim().min(2).optional(),
  lastName: z.string().trim().min(2).optional(),
  email: z.email().trim().optional(),
  telephone: z.string().trim().min(9).optional(),
  sex: z.enum(Sex),
  ageGroup: z.enum(AgeGroup),
  city: z.string().trim().min(2).optional(),
});

export const createVictimSchema = victimSchema.refine(
  (data) => {
    const identityFields = [
      data.firstName,
      data.lastName,
      data.email,
      data.telephone,
      data.city,
    ];

    const filled = identityFields.filter(Boolean).length;
    return filled === 0 || filled === identityFields.length;
  },
  {
    message:
      "If one identity field is provided, all identity fields are required.",
  },
);

export const updateVictimSchema = victimSchema.partial();

export type CreatevictimDto = z.infer<typeof createVictimSchema>;
export type UpdatevictimDto = z.infer<typeof updateVictimSchema>;
