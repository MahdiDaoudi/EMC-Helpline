import bcrypt from "bcrypt";
import { generatePassword } from "../../utils/password";
import * as userRepository from "./users.repository";
import { CreateUserDto, UpdateUserDto } from "./users.schema";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { enrichUserProfile } from "../profile/profile.service";
import { sendEmail } from "../email/email.service";
import { userCreatedTemplate } from "../email/templates/users/user-created.template";

export async function getUsers() {
  const users = await userRepository.findAll();
  return Promise.all(users.map((u) => enrichUserProfile(u)));
}

export async function getUser(id: number) {
  const user = await userRepository.findById(id);
  return user ? enrichUserProfile(user) : null;
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

  const roleId = user.roleId ?? existing.roleId;
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    throw new ApiError(400, "Rôle invalide.");
  }

  let finalOrganizationId: number | null = null;
  if (role.name === "ORGANIZATION_USER") {
    const orgId = user.organizationId !== undefined ? user.organizationId : existing.organizationId;
    if (!orgId || orgId <= 0) {
      throw new ApiError(400, "Une organisation est obligatoire pour le rôle Utilisateur Organisation.");
    }
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      throw new ApiError(400, "Organisation invalide.");
    }
    finalOrganizationId = orgId;
  } else {
    finalOrganizationId = null;
  }

  const updatedPayload: UpdateUserDto = {
    ...user,
    organizationId: finalOrganizationId as any,
  };

  try {
    return await userRepository.update(id, updatedPayload);
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
  
  const role = await prisma.role.findUnique({ where: { id: user.roleId } });
  if (!role) {
    throw new ApiError(400, "Rôle invalide.");
  }

  let finalOrganizationId: number | null = null;
  if (role.name === "ORGANIZATION_USER") {
    if (!user.organizationId || user.organizationId <= 0) {
      throw new ApiError(400, "Une organisation est obligatoire pour le rôle Utilisateur Organisation.");
    }
    const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
    if (!org) {
      throw new ApiError(400, "Organisation invalide.");
    }
    finalOrganizationId = user.organizationId;
  } else {
    finalOrganizationId = null;
  }

  const userPayload: CreateUserDto = {
    ...user,
    organizationId: finalOrganizationId as any,
  };

  try {
    const newUser = await userRepository.create(userPayload, hashedPassword);
    const html = userCreatedTemplate({
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role?.name,
      temporaryPassword: generatedPassword,
      loginUrl: process.env.FRONTEND_URL + "/login",
    });

    await sendEmail({
      to: newUser.email,
      subject: "Bienvenue sur EMC HELPLINE",
      html,
    });
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
