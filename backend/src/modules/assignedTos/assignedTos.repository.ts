import { prisma } from "../../config/prisma";
import { AssignmentStatus, AccompanimentType } from "../../generated/prisma/enums";
import { UpdateAssignedToDto } from "./assignedTos.schema";

export function findAll() {
  return prisma.assignedTo.findMany();
}

export function findById(signalementId: number, organizationId: number) {
  return prisma.assignedTo.findFirst({
    where: {
      signalementId,
      organizationId,
    },
  });
}

export function create(
  status: AssignmentStatus,
  type: AccompanimentType,
  signalementId: number,
  organizationId: number,
) {
  return prisma.assignedTo.create({
    data: {
      status: status,
      type: type,
      organizationId: organizationId,
      signalementId: signalementId,
    },
  });
}

export function update(
  data: UpdateAssignedToDto,
  signalementId: number,
  organizationId: number,
  type: AccompanimentType,
) {
  return prisma.assignedTo.update({
    where: {
      signalementId_organizationId_type: {
        signalementId,
        organizationId,
        type,
      },
    },
    data,
  });
}

export function deleteById(signalementId: number, organizationId: number, type: AccompanimentType) {
  return prisma.assignedTo.delete({
    where: {
      signalementId_organizationId_type: {
        signalementId,
        organizationId,
        type,
      },
    },
  });
}
