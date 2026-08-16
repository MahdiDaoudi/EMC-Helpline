import bcrypt from "bcrypt";
import { generatePassword } from "../../utils/password";
import * as userRepository from "./users.repository";
import { CreateUserDto, UpdateUserDto } from "./users.schema";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

export function getUsers() {
  return userRepository.findAll();
}

export function getUser(id: number) {
  return userRepository.findById(id);
}

export async function editUser(id: number, user: UpdateUserDto) {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw new ApiError(404, "Utilisateur introuvable.");
  }

  if (user.email && user.email.toLowerCase() !== existing.email.toLowerCase()) {
    const duplicate = await prisma.user.findUnique({
      where: { email: user.email.toLowerCase() },
    });
    if (duplicate && duplicate.id !== id) {
      throw new ApiError(409, "Un utilisateur avec cet email existe déjà.");
    }
  }

  if (user.roleId) {
    const role = await prisma.role.findUnique({ where: { id: user.roleId } });
    if (!role) {
      throw new ApiError(400, "Rôle invalide.");
    }
  }

  if (user.organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    });
    if (!org) {
      throw new ApiError(400, "Organisation invalide.");
    }
  }

  try {
    return await userRepository.update(id, user);
  } catch (err: any) {
    if (err?.code === "P2002" && err?.meta?.target?.includes("email")) {
      throw new ApiError(409, "Un utilisateur avec cet email existe déjà.");
    }
    throw err;
  }
}

export async function addUser(user: CreateUserDto) {
  const generatedPassword = generatePassword();
  const hashedPassword = await bcrypt.hash(generatedPassword, 10);
  // Validate role and organization existence
  const role = await prisma.role.findUnique({ where: { id: user.roleId } });
  if (!role) {
    throw new ApiError(400, "Rôle invalide.");
  }

  if (user.organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    });
    if (!org) {
      throw new ApiError(400, "Organisation invalide.");
    }
  }

  try {
    const newUser = await userRepository.create(user, hashedPassword);
    return {
      user: newUser,
      password: generatedPassword,
    };
  } catch (err: any) {
    // map unique constraint on email to friendly error
    if (err?.code === "P2002" && err?.meta?.target?.includes("email")) {
      throw new ApiError(409, "Un utilisateur avec cet email existe déjà.");
    }
    throw err;
  }
}

export async function deleteUser(id: number) {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw new ApiError(404, "Utilisateur introuvable.");
  }

  // Check dependent records that must be preserved (validations, history)
  const validateCount = await prisma.validate.count({ where: { userId: id } });

  if (validateCount > 0) {
    // Soft-deactivate the user instead of deleting to preserve history
    await userRepository.update(id, { isActive: false });
    throw new ApiError(
      400,
      "Cet utilisateur possède des données associées et a été désactivé.",
    );
  }

  return userRepository.deleteById(id);
}
