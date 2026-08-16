import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import * as profileRepository from "./profile.repository";
import { ChangePasswordDto, ProfileUpdateDto } from "./profile.schema";

export async function getProfile(userId: number) {
  const user = await profileRepository.findById(userId);

  if (!user) {
    throw new ApiError(404, "Profil introuvable.");
  }

  return user;
}

export async function updateProfile(userId: number, data: ProfileUpdateDto) {
  const existing = await profileRepository.findById(userId);

  if (!existing) {
    throw new ApiError(404, "Profil introuvable.");
  }

  if (data.email && data.email.toLowerCase() !== existing.email.toLowerCase()) {
    const duplicate = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (duplicate && duplicate.id !== userId) {
      throw new ApiError(409, "Un utilisateur avec cet email existe déjà.");
    }
  }

  return profileRepository.update(userId, data);
}

export async function changePassword(userId: number, data: ChangePasswordDto) {
  const user = await profileRepository.findById(userId);

  if (!user) {
    throw new ApiError(404, "Profil introuvable.");
  }

  // Fetch hashed password directly for verification (do not expose it in repo responses)
  const persisted = await prisma.user.findUnique({
    where: { id: userId },
    select: { hashedPassword: true },
  });
  if (!persisted) {
    throw new ApiError(404, "Profil introuvable.");
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    data.currentPassword,
    persisted.hashedPassword,
  );
  if (!isCurrentPasswordValid) {
    throw new ApiError(401, "Le mot de passe actuel est incorrect.");
  }

  if (data.newPassword.length < 8) {
    throw new ApiError(
      400,
      "Le nouveau mot de passe doit contenir au moins 8 caractères.",
    );
  }

  if (data.newPassword === data.currentPassword) {
    throw new ApiError(
      400,
      "Le nouveau mot de passe doit être différent du mot de passe actuel.",
    );
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 10);
  return profileRepository.updatePassword(userId, hashedPassword);
}
