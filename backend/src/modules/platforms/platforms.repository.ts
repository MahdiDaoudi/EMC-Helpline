import { prisma } from "../../config/prisma";
import { CreatePlatformDto, UpdatePlatformDto } from "./platforms.schema";

export function findAll() {
  return prisma.platform.findMany();
}

export function findById(id: number) {
  return prisma.platform.findUnique({
    where: { id },
  });
}

export function findByName(name: string) {
  return prisma.platform.findUnique({
    where: { name },
  });
}

export function create(data: CreatePlatformDto) {
  return prisma.platform.create({
    data,
  });
}

export function update(id: number, data: UpdatePlatformDto) {
  return prisma.platform.update({
    where: { id },
    data,
  });
}

export function deleteById(id: number) {
  return prisma.platform.delete({
    where: { id },
  });
}
