import { ApiError } from "../../utils/ApiError";
import { generateAccessToken } from "../../utils/jwt";
import * as authRepository from "./auth.repository";
import bcrypt from "bcrypt";
import { enrichUserProfile } from "../profile/profile.service";
import { prisma } from "../../config/prisma";
import { generatePassword } from "../../utils/password";
import { sendEmail } from "../email/email.service";
import { resetPasswordTemplate } from "../email/templates/users/reset-password.template";

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

  const now = new Date();
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: now },
  });

  const token = generateAccessToken(user.id, user.role.name, user.organizationId);

  const enrichedUser = await enrichUserProfile(user);

  return {
    accessToken: token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileImageUrl: enrichedUser?.profileImageUrl ?? user.profileImageUrl,
      isActive: user.isActive,
      isLocked: user.isLocked,
      lastLogin: now.toISOString(),
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


export async function resetPassword(email: string) {
  const user = await authRepository.findByEmail(email);

  if (!user) {
    throw new ApiError(401, "Invalid email");
  }

  const generatedPassword = generatePassword();
  const hashedPassword = await bcrypt.hash(generatedPassword, 10);

  await authRepository.updatePassword(email, hashedPassword);

  const html = resetPasswordTemplate({
    firstName: user.firstName,
    temporaryPassword: generatedPassword,
    loginUrl: process.env.FRONTEND_URL + "/login",
  });

  await sendEmail({
    to: user.email,
    subject: "Réinitialisation de mot de passe",
    html,
  });
  
}