import { ApiError } from "../../utils/ApiError";
import { generateAccessToken } from "../../utils/jwt";
import * as authRepository from "./auth.repository";
import bcrypt from "bcrypt";

export async function login(email: string, password: string) {
  const user = await authRepository.findByEmail(email);

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.isLocked || !user.isActive) {
    throw new ApiError(403, "ACCOUNT_LOCKED");
  }

  const isValidPassword = await bcrypt.compare(password, user.hashedPassword);

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateAccessToken(user.id, user.role.name);

  return {
    accessToken: token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      isActive: user.isActive,
      isLocked: user.isLocked,
      lastLogin: user.lastLogin?.toISOString() ?? null,
      roleId: user.roleId,
      role: {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
      },
      organizationId: user.organizationId,
      createdAt: user.createdAt.toISOString(),
    },
  };
}
