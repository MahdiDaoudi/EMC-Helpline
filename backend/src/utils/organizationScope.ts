import { JwtPayload } from "../types/jwt";
import { RoleName } from "../generated/prisma/enums";

export function getOrganizationScope(user: JwtPayload) {
  if (user.role === RoleName.ORGANIZATION_USER) {
    if (!user.organizationId) {
      return { organizationId: -1 };
    }
    return { organizationId: user.organizationId };
  }
  return {};
}

export function getSignalementOrgFilter(user: JwtPayload) {
  if (user.role === RoleName.ORGANIZATION_USER) {
    if (!user.organizationId) {
      return { assignedTo: { some: { organizationId: -1 } } };
    }
    return { assignedTo: { some: { organizationId: user.organizationId } } };
  }
  return {};
}
