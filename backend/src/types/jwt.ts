import { RoleName } from "../generated/prisma/enums";

export type JwtPayload = {
  userId: number;
  role: RoleName;
  organizationId?: number | null;
};
