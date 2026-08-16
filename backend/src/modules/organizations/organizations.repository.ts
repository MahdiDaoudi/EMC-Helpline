import { prisma } from "../../config/prisma";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "./organizations.schema";

export function findAll() {
  return prisma.organization.findMany();
}

export function findById(id: number) {
  return prisma.organization.findUnique({
    where: {
      id,
    },
  });
}

export function create(data: CreateOrganizationDto) {
  return prisma.organization.create({
    data,
  });
}

export function update(id: number, data: UpdateOrganizationDto) {
  return prisma.organization.update({
    where: { id },
    data,
  });
}

export function deleteById(id: number) {
  return prisma.organization.delete({
    where: { id },
  });
}
