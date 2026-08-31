import { prisma } from "../../config/prisma";
import { AssignmentStatus, AccompanimentType } from "../../generated/prisma/enums";
import { UpdateAssignedToDto } from "./assignedTos.schema";

export interface AssignedToQueryParams {
  search?: string;
  organizationId?: number;
  type?: AccompanimentType;
  status?: AssignmentStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

function buildWhereClause(params?: AssignedToQueryParams) {
  const where: any = {};

  if (params?.organizationId) {
    where.organizationId = Number(params.organizationId);
  }

  if (params?.type) {
    where.type = params.type;
  }

  if (params?.status) {
    where.status = params.status;
  }

  if (params?.dateFrom || params?.dateTo) {
    where.createdAt = {};
    if (params.dateFrom) {
      where.createdAt.gte = new Date(params.dateFrom);
    }
    if (params.dateTo) {
      const endDate = new Date(params.dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  const search = params?.search?.trim();
  if (search) {
    where.OR = [
      { reason: { contains: search } },
      { organization: { name: { contains: search } } },
      { organization: { nickname: { contains: search } } },
      { signalement: { victim: { referenceNumber: { contains: search } } } },
      { signalement: { victim: { firstName: { contains: search } } } },
      { signalement: { victim: { lastName: { contains: search } } } },
      { signalement: { victim: { email: { contains: search } } } },
    ];
  }

  return where;
}

export function findAll(params?: AssignedToQueryParams) {
  const page = Math.max(1, Number(params?.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(params?.limit ?? 20)));
  const where = buildWhereClause(params);

  return prisma.assignedTo.findMany({
    where,
    include: {
      organization: true,
      signalement: {
        include: {
          victim: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
}

export function countAll(params?: AssignedToQueryParams) {
  const where = buildWhereClause(params);
  return prisma.assignedTo.count({ where });
}

export function findById(signalementId: number, organizationId: number) {
  return prisma.assignedTo.findFirst({
    where: {
      signalementId,
      organizationId,
    },
    include: {
      organization: true,
      signalement: {
        include: {
          victim: true,
        },
      },
    },
  });
}

export function create(
  status: AssignmentStatus,
  type: AccompanimentType,
  signalementId: number,
  organizationId: number,
  reason?: string,
) {
  return prisma.assignedTo.create({
    data: {
      status,
      type,
      organizationId,
      signalementId,
      reason,
    },
    include: {
      organization: true,
      signalement: {
        include: {
          victim: true,
        },
      },
    },
  });
}

export function update(
  data: UpdateAssignedToDto,
  signalementId: number,
  organizationId: number,
  type: AccompanimentType,
) {
  const updateData: any = { ...data };

  if (data.status === AssignmentStatus.IN_PROGRESS) {
    updateData.processedAt = new Date();
  } else if (data.status === AssignmentStatus.COMPLETED || data.status === AssignmentStatus.CLOSED) {
    updateData.closedAt = new Date();
  }

  if (
    data.reportActions !== undefined ||
    data.reportObservations !== undefined ||
    data.reportResult !== undefined ||
    data.reportRecommendations !== undefined
  ) {
    updateData.reportUpdatedAt = new Date();
  }

  return prisma.assignedTo.update({
    where: {
      signalementId_organizationId_type: {
        signalementId,
        organizationId,
        type,
      },
    },
    data: updateData,
    include: {
      organization: true,
      signalement: {
        include: {
          victim: true,
        },
      },
    },
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
