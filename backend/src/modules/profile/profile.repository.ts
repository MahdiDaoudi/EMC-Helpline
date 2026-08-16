import { prisma } from "../../config/prisma";
import { ProfileUpdateDto } from "./profile.schema";

export function findById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImageUrl: true,
      isActive: true,
      isLocked: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
      roleId: true,
      organizationId: true,
      role: { select: { id: true, name: true, description: true } },
      organization: {
        select: { id: true, nickname: true, name: true, email: true },
      },
    },
  });
}

export function update(id: number, data: ProfileUpdateDto) {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImageUrl: true,
      isActive: true,
      isLocked: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
      roleId: true,
      organizationId: true,
      role: { select: { id: true, name: true, description: true } },
      organization: {
        select: { id: true, nickname: true, name: true, email: true },
      },
    },
  });
}

export function updatePassword(id: number, hashedPassword: string) {
  return prisma.user.update({
    where: { id },
    data: { hashedPassword },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImageUrl: true,
      isActive: true,
      isLocked: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
      roleId: true,
      organizationId: true,
      role: { select: { id: true, name: true, description: true } },
      organization: {
        select: { id: true, nickname: true, name: true, email: true },
      },
    },
  });
}
