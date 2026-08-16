import {z} from "zod"
import { RoleName } from "../../generated/prisma/enums"

export const createRoleSchema = z.object({
    name: z.enum(RoleName),
    description: z.string().trim().min(5)
})

export const updateRoleSchema = createRoleSchema.partial();

export type CreateRoleDto = z.infer<typeof createRoleSchema>
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>