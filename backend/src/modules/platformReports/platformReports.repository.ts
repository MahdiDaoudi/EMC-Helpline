import { prisma } from "../../config/prisma";
import { PlatformReportStatus } from "../../generated/prisma/enums";
import {
  CreatePlatformReportDto,
  UpdatePlatformReportDto,
} from "./platformReports.schema";

export function findAll() {
  return prisma.platformReport.findMany();
}

export function findById(signalementId: number, platformId: number) {
  return prisma.platformReport.findUnique({
    where: {
      signalementId_platformId: {
        platformId: platformId,
        signalementId: signalementId,
      },
    },
    include: {
      signalement: true,
      platform: true,
    },
  });
}

export function create(
  data: CreatePlatformReportDto,
  status: PlatformReportStatus,
) {
  return prisma.platformReport.create({
    data: {
      signalement: {
        connect: {
          id: data.signalementId,
        },
      },
      platform: {
        connect: {
          id: data.platformId,
        },
      },
      status: status,
      emailSubject: data.emailSubject,
      emailBody: data.emailBody,
      emailTo: data.emailTo,
      selectedScreenshotUrls: data.selectedScreenshotUrls?.length
        ? JSON.stringify(data.selectedScreenshotUrls)
        : null,
    },
  });
}

export function update(
  data: UpdatePlatformReportDto,
  signalementId: number,
  platformId: number,
) {
  return prisma.platformReport.update({
    where: {
      signalementId_platformId: {
        signalementId: signalementId,
        platformId: platformId,
      },
    },
    data: {
      status: data.status,
      closedAt: data.closedAt ? new Date(data.closedAt) : undefined,
    },
  });
}

export function deleteById(signalementId: number, platformId: number) {
  return prisma.platformReport.delete({
    where: {
      signalementId_platformId: {
        signalementId: signalementId,
        platformId: platformId,
      },
    },
  });
}
