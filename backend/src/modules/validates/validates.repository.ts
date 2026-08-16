import { prisma } from "../../config/prisma";
import { CreateValidateDto, UpdateValidateDto } from "./validates.schema";

export function findAll() {
  return prisma.validate.findMany();
}

export function findById(signalementId: number, userId: number) {
  return prisma.validate.findUnique({
    where: {
      signalementId_userId: {
        signalementId: signalementId,
        userId: userId,
      },
    },
  });
}

export function create(
  data: CreateValidateDto,
  signalementId: number,
  userId: number,
) {
  return prisma.validate.create({
    data: {
      type: data.type,
      status: data.status,
      reason: data.reason,
      signalementId: signalementId,
      userId: userId,
    },
  });
}

export function update(
  data: UpdateValidateDto,
  signalementId: number,
  userId: number,
) {
  return prisma.validate.update({
    where: {
      signalementId_userId: {
        signalementId: signalementId,
        userId: userId,
      },
    },
    data,
  });
}

export function deleteById(signalementId: number, userId: number) {
  return prisma.validate.delete({
    where: {
      signalementId_userId: {
        signalementId: signalementId,
        userId: userId,
      },
    },
  });
}
