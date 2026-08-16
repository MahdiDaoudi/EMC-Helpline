import { prisma } from "../../config/prisma";
import { CreateUserDto, UpdateUserDto } from "./users.schema";

export function findAll() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
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

export function update(id: number, data: UpdateUserDto) {
  return prisma.user.update({
    where: { id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      roleId: data.roleId,
      isActive: data.isActive,
      isLocked: data.isLocked,
      profileImageUrl: data.profileImageUrl,
      organizationId: data.organizationId,
    },
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

export function create(data: CreateUserDto, hashedPassword: string) {
  return prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      organizationId: data.organizationId,
      roleId: data.roleId,
      hashedPassword: hashedPassword,
    },
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

export function deleteById(id: number) {
  return prisma.user.delete({
    where: {
      id: id,
    },
  });
}
