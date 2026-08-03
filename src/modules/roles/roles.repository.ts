import { prisma } from "../../config/prisma";
import { RoleName } from "../../generated/prisma/enums";
import { CreateRoleDto, UpdateRoleDto } from "./roles.schema";

export function findAll() {
  return prisma.role.findMany();
}

export function findById(id: number) {
  return prisma.role.findUnique({
    where: {
      id,
    },
  });
}

export function create(data: CreateRoleDto) {
  return prisma.role.create({
    data,
  });
}

export function update(id: number, data: UpdateRoleDto) {
  return prisma.role.update({
    where: {
      id,
    },
    data,
  });
}

export function deleteById(id: number) {
  return prisma.role.delete({
    where: {
      id,
    },
  });
}

export function findByName(name: RoleName) {
  return prisma.role.findUnique({
    where: { name },
  });
}
