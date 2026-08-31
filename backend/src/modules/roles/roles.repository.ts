import { prisma } from "../../config/prisma";
import { CreateRoleDto, UpdateRoleDto } from "./roles.schema";

export function findAll() {
  return prisma.role.findMany({
    include: {
      _count: {
        select: { users: true },
      },
    },
    orderBy: { id: "asc" },
  });
}

export function findById(id: number) {
  return prisma.role.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });
}

export function create(data: CreateRoleDto) {
  return prisma.role.create({
    data,
    include: {
      _count: {
        select: { users: true },
      },
    },
  });
}

export function update(id: number, data: UpdateRoleDto) {
  return prisma.role.update({
    where: {
      id,
    },
    data,
    include: {
      _count: {
        select: { users: true },
      },
    },
  });
}

export function deleteById(id: number) {
  return prisma.role.delete({
    where: {
      id,
    },
  });
}

export function findByName(name: string) {
  return prisma.role.findUnique({
    where: { name },
  });
}

