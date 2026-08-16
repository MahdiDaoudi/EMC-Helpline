import { prisma } from "../../config/prisma";
import {
  CreateSignalementDto,
  UpdateSignalementDto,
} from "./signalements.schema";
import {
  CreateSignalementWithExistingVictimData,
  CreateSignalementWithNewVictimData,
} from "./signalements.types";
import { randomBytes } from "crypto";

const victimPublicSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  telephone: true,
  sex: true,
  ageGroup: true,
  city: true,
  isAnonymous: true,
  referenceNumber: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function findAll(params?: {
  search?: string;
  status?: string;
  priority?: string;
  titulaire?: string;
  cyberViolenceId?: number;
  accompanimentType?: string;
  issuer?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, Number(params?.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(params?.limit ?? 20)));
  const search = params?.search?.trim();

  const where: any = {};

  if (params?.status) {
    where.status = params.status;
  }

  if (params?.priority) {
    where.priority = params.priority;
  }

  if (params?.titulaire) {
    where.titulaire = params.titulaire;
  }

  if (params?.cyberViolenceId) {
    where.cyberViolenceId = Number(params.cyberViolenceId);
  }

  if (params?.issuer) {
    where.issuer = { contains: params.issuer };
  }

  if (params?.accompanimentType) {
    where.accompaniments = {
      some: {
        type: params.accompanimentType,
      },
    };
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

  if (search) {
    where.OR = [
      { issuer: { contains: search } },
      { description: { contains: search } },
      { otherCyberViolence: { contains: search } },
      { victim: { firstName: { contains: search } } },
      { victim: { lastName: { contains: search } } },
      { victim: { email: { contains: search } } },
      { victim: { telephone: { contains: search } } },
      { victim: { referenceNumber: { contains: search } } },
      { cyberViolence: { name: { contains: search } } },
      { accompaniments: { some: { type: { contains: search } } } },
    ];
  }

  return prisma.signalement.findMany({
    where,
    include: {
      victim: { select: victimPublicSelect },
      cyberViolence: true,
      accompaniments: true,
      reportedItems: {
        include: {
          platform: true,
          screenshots: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
}

export function countAll(params?: {
  search?: string;
  status?: string;
  priority?: string;
  titulaire?: string;
  cyberViolenceId?: number;
  accompanimentType?: string;
  issuer?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const search = params?.search?.trim();
  const where: any = {};

  if (params?.status) where.status = params.status;
  if (params?.priority) where.priority = params.priority;
  if (params?.titulaire) where.titulaire = params.titulaire;
  if (params?.cyberViolenceId)
    where.cyberViolenceId = Number(params.cyberViolenceId);
  if (params?.issuer) where.issuer = { contains: params.issuer };
  if (params?.accompanimentType) {
    where.accompaniments = {
      some: {
        type: params.accompanimentType,
      },
    };
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

  if (search) {
    where.OR = [
      { issuer: { contains: search } },
      { description: { contains: search } },
      { otherCyberViolence: { contains: search } },
      { victim: { firstName: { contains: search } } },
      { victim: { lastName: { contains: search } } },
      { victim: { email: { contains: search } } },
      { victim: { telephone: { contains: search } } },
      { victim: { referenceNumber: { contains: search } } },
      { cyberViolence: { name: { contains: search } } },
      { accompaniments: { some: { type: { contains: search } } } },
    ];
  }

  return prisma.signalement.count({ where });
}

export function findById(id: number) {
  return prisma.signalement.findUnique({
    where: { id },
    include: {
      victim: {
        select: victimPublicSelect,
      },
      cyberViolence: true,
      accompaniments: true,
      reportedItems: {
        include: {
          platform: true,
          screenshots: true,
        },
      },
      platforms: {
        include: {
          platform: true,
        },
      },
      validate: {
        include: {
          user: {
            include: {
              role: true,
            },
          },
        },
      },
      assignedTo: {
        include: {
          organization: true,
        },
      },
    },
  });
}

export async function createWithExistingVictim(
  data: CreateSignalementDto,
  serviceData: CreateSignalementWithExistingVictimData,
) {
  return prisma.signalement.create({
    data: {
      description: data.description,
      status: serviceData.status,
      priority: serviceData.priority,
      issuer: serviceData.issuer,
      titulaire: serviceData.titulaire,
      otherCyberViolence: data.otherCyberViolence,
      victimId: serviceData.victimId,
      cyberViolenceId: data.cyberViolenceId,
      accompaniments: {
        create: (serviceData.accompanimentTypes ?? []).map((type) => ({
          type,
        })),
      },
      reportedItems: {
        create: data.reportedItems.map((item) => ({
          type: item.type,
          platform: {
            connect: { id: item.platformId },
          },
          description: item.description,
          contentUrl: item.contentUrl,
        })),
      },
    },
    include: {
      victim: true,
      cyberViolence: true,
      accompaniments: true,
      reportedItems: {
        include: {
          platform: true,
          screenshots: true,
        },
      },
    },
  });
}

export async function createWithNewVictim(
  data: CreateSignalementDto,
  serviceData: CreateSignalementWithNewVictimData,
) {
  const victimData = data.victim;

  if (!victimData) {
    throw new Error("Victim payload is required when creating a new victim.");
  }

  return prisma.$transaction(async (tx) => {
    const victim = await tx.victim.create({
      data: {
        firstName: victimData.firstName,
        lastName: victimData.lastName,
        email: victimData.email,
        telephone: victimData.telephone,
        city: victimData.city,
        sex: victimData.sex,
        ageGroup: victimData.ageGroup,
        referenceNumber: serviceData.referenceNumber,
        hashedPassword: serviceData.hashedPassword,
        isAnonymous: serviceData.isAnonymous,
      },
    });

    await tx.victim.update({
      where: { id: victim.id },
      data: {
        referenceNumber: generateReferenceNumber(victim.id),
      },
    });

    const signalement = await tx.signalement.create({
      data: {
        description: data.description,
        issuer: serviceData.issuer,
        titulaire: serviceData.titulaire,
        otherCyberViolence: data.otherCyberViolence,
        cyberViolenceId: data.cyberViolenceId,
        victimId: victim.id,
        status: serviceData.status,
        priority: serviceData.priority,
        accompaniments: {
          create: (serviceData.accompanimentTypes ?? []).map((type) => ({
            type,
          })),
        },
        reportedItems: {
          create: data.reportedItems.map((item) => ({
            type: item.type,
            platform: {
              connect: { id: item.platformId },
            },
            description: item.description,
            contentUrl: item.contentUrl,
          })),
        },
      },
      include: {
        victim: {
          select: victimPublicSelect,
        },
        cyberViolence: true,
        accompaniments: true,
        reportedItems: {
          include: {
            platform: true,
            screenshots: true,
          },
        },
      },
    });
    return signalement;
  });
}

export function update(id: number, data: UpdateSignalementDto) {
  return prisma.signalement.update({
    where: { id },
    data,
  });
}

export function deleteById(id: number) {
  return prisma.signalement.delete({
    where: { id },
  });
}

function generateReferenceNumber(id: number) {
  return `EMC-${id}${randomBytes(4).toString("hex").toUpperCase()}`;
}
