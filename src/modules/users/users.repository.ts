import { prisma } from "../../config/prisma";
import { CreateUserDto, UpdateUserDto } from "./users.schema";

export function findAll() {
  return prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      isLocked: true,
      role: true,
    },
  });
}

export function findById(id: number) {
  return prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      isLocked: true,
      profileImageUrl:true,
      role: true,
    },
  });
}

export function update(id: number, data: UpdateUserDto) {
  return prisma.user.update({
    where: {
      id: id,
    },
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
  });
}

export function deleteById(id: number) {
  return prisma.user.delete({
    where: {
      id: id,
    },
  });
}
