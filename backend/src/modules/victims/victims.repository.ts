import { prisma } from "../../config/prisma";
import { CreatevictimDto, UpdatevictimDto } from "./victims.schema";
import { CreateVictimServiceData } from "./victims.types";

export function findAll() {
  return prisma.victim.findMany({
    include: {
      _count: {
        select: { signalement: true },
      },
      signalement: {
        include: {
          cyberViolence: true,
          accompaniments: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function findById(id: number) {
  return prisma.victim.findUnique({
    where: { id },
    include: {
      _count: {
        select: { signalement: true },
      },
      signalement: {
        include: {
          cyberViolence: true,
          accompaniments: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export function update(id: number, data: UpdatevictimDto) {
  return prisma.victim.update({
    where: { id },
    data,
  });
}

export function deleteById(id: number) {
  return prisma.victim.delete({
    where: { id },
  });
}
