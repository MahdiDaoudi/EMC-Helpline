import { prisma } from "../../config/prisma";
import { SignalementStatus, Priority } from "../../generated/prisma/enums";
import { createSignedUrl } from "../../services/supabaseStorage.service";
import * as platformsService from "../platforms/platforms.service";

import { JwtPayload } from "../../types/jwt";
import { getSignalementOrgFilter } from "../../utils/organizationScope";

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getDashboardStats(user?: JwtPayload) {
  if (user && user.role === "ORGANIZATION_USER") {
    const orgId = user.organizationId ?? -1;

    const [
      totalSignalements,
      assignedCount,
      pendingCount,
      inProgressCount,
      onHoldCount,
      completedCount,
      closedCount,
    ] = await Promise.all([
      prisma.assignedTo.count({ where: { organizationId: orgId } }),
      prisma.assignedTo.count({ where: { organizationId: orgId, status: "ASSIGNED" } }),
      prisma.assignedTo.count({ where: { organizationId: orgId, status: "PENDING" } }),
      prisma.assignedTo.count({ where: { organizationId: orgId, status: "IN_PROGRESS" } }),
      prisma.assignedTo.count({ where: { organizationId: orgId, status: "ON_HOLD" } }),
      prisma.assignedTo.count({ where: { organizationId: orgId, status: "COMPLETED" } }),
      prisma.assignedTo.count({ where: { organizationId: orgId, status: "CLOSED" } }),
    ]);

    const receivedCount = assignedCount + pendingCount;
    const resolvedCount = completedCount + closedCount;

    return {
      totalSignalements,
      pendingSignalements: receivedCount,
      inProgressSignalements: inProgressCount,
      onHoldSignalements: onHoldCount,
      resolvedSignalements: resolvedCount,
      closedSignalements: closedCount,
      highPriorityCases: 0,
      totalOrganizations: 1,
      totalVictims: 0,
      topPlatforms: [],
      trends: {
        total: 10,
        pending: 5,
        resolved: 15,
        highPriority: 0,
      },
    };
  }

  const orgFilter = user ? getSignalementOrgFilter(user) : {};

  const [
    totalSignalements,
    pendingSignalements,
    inProgressSignalements,
    validatedSignalements,
    closedSignalements,
    highPriorityCases,
    totalOrganizations,
    totalVictims,
  ] = await Promise.all([
    prisma.signalement.count({ where: orgFilter }),
    prisma.signalement.count({
      where: {
        ...orgFilter,
        status: SignalementStatus.PENDING,
      },
    }),
    prisma.signalement.count({
      where: {
        ...orgFilter,
        status: SignalementStatus.IN_PROGRESS,
      },
    }),
    prisma.signalement.count({
      where: {
        ...orgFilter,
        status: SignalementStatus.VALIDATED,
      },
    }),
    prisma.signalement.count({
      where: {
        ...orgFilter,
        status: SignalementStatus.CLOSED,
      },
    }),
    prisma.signalement.count({
      where: {
        ...orgFilter,
        priority: Priority.URGENT,
      },
    }),
    prisma.organization.count(),
    prisma.victim.count(),
  ]);

  const resolvedSignalements = validatedSignalements + closedSignalements;
  const pendingCount = pendingSignalements + inProgressSignalements;

  const total = 12.5;
  const pendingTrend = Math.max(
    -99,
    Number((((pendingCount - 120) / 120) * 100).toFixed(1)),
  );
  const resolvedTrend = Math.max(
    -99,
    Number((((resolvedSignalements - 900) / 900) * 100).toFixed(1)),
  );
  const highPriorityTrend = Math.max(
    -99,
    Number((((highPriorityCases - 35) / 35) * 100).toFixed(1)),
  );

  const topPlatforms = await getTopPlatforms(0, user);

  return {
    totalSignalements,
    pendingSignalements,
    inProgressSignalements,
    resolvedSignalements,
    closedSignalements,
    highPriorityCases,
    totalOrganizations,
    totalVictims,
    topPlatforms,
    trends: {
      total,
      pending: pendingTrend,
      resolved: resolvedTrend,
      highPriority: highPriorityTrend,
    },
  };
}

export async function getTopPlatforms(limit = 5, user?: JwtPayload) {
  const platforms = await platformsService.getAllPlatforms();
  const orgFilter = user ? getSignalementOrgFilter(user) : {};

  const reportedItemWhere: any = {};
  if (user && user.role === "ORGANIZATION_USER") {
    reportedItemWhere.signalement = orgFilter;
  }

  const groupedCounts = await prisma.reportedItem.groupBy({
    by: ['platformId'],
    where: reportedItemWhere,
    _count: {
      platformId: true,
    },
  });

  const countMap = new Map<number, number>();
  for (const group of groupedCounts) {
    countMap.set(group.platformId, group._count.platformId);
  }

  const mapped = platforms.map((p: any) => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
    count: Number(countMap.get(p.id) ?? 0),
  }));

  const sorted = mapped.sort((a, b) => b.count - a.count);

  if (limit && limit > 0) return sorted.slice(0, limit);
  return sorted;
}

export async function getTimeSeriesData(range = "30d", user?: JwtPayload) {
  const dayCount =
    range === "7d" ? 7 : range === "3m" ? 90 : range === "12m" ? 365 : 30;
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (dayCount - 1));

  if (user && user.role === "ORGANIZATION_USER") {
    const orgId = user.organizationId ?? -1;
    const assignments = await prisma.assignedTo.findMany({
      where: {
        organizationId: orgId,
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        status: true,
      },
    });

    const grouped = new Map<
      string,
      {
        total: number;
        validated: number;
        inProgress: number;
        pending: number;
        rejected: number;
      }
    >();

    for (let i = 0; i < dayCount; i += 1) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const key = formatDateKey(date);
      grouped.set(key, {
        total: 0,
        validated: 0,
        inProgress: 0,
        pending: 0,
        rejected: 0,
      });
    }

    for (const item of assignments) {
      const key = formatDateKey(new Date(item.createdAt));
      const bucket = grouped.get(key);
      if (!bucket) continue;

      bucket.total += 1;

      if (item.status === "COMPLETED" || item.status === "CLOSED") {
        bucket.validated += 1;
      } else if (item.status === "IN_PROGRESS") {
        bucket.inProgress += 1;
      } else if (item.status === "ASSIGNED" || item.status === "PENDING" || item.status === "ON_HOLD") {
        bucket.pending += 1;
      } else if (item.status === "REJECTED") {
        bucket.rejected += 1;
      }
    }

    return Array.from(grouped.entries()).map(([date, values]) => ({
      date: new Date(`${date}T00:00:00Z`).toLocaleDateString("fr-FR", {
        month: "short",
        day: "numeric",
      }),
      total: values.total,
      validated: values.validated,
      inProgress: values.inProgress,
      pending: values.pending,
      rejected: values.rejected,
    }));
  }

  const orgFilter = user ? getSignalementOrgFilter(user) : {};

  const signalements = await prisma.signalement.findMany({
    where: {
      ...orgFilter,
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
      status: true,
    },
  });

  const grouped = new Map<
    string,
    {
      total: number;
      validated: number;
      inProgress: number;
      pending: number;
      rejected: number;
    }
  >();

  for (let i = 0; i < dayCount; i += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const key = formatDateKey(date);
    grouped.set(key, {
      total: 0,
      validated: 0,
      inProgress: 0,
      pending: 0,
      rejected: 0,
    });
  }

  for (const signalement of signalements) {
    const key = formatDateKey(new Date(signalement.createdAt));
    const bucket = grouped.get(key);
    if (!bucket) continue;

    bucket.total += 1;

    if (signalement.status === SignalementStatus.VALIDATED) {
      bucket.validated += 1;
    } else if (signalement.status === SignalementStatus.IN_PROGRESS) {
      bucket.inProgress += 1;
    } else if (signalement.status === SignalementStatus.PENDING) {
      bucket.pending += 1;
    } else if (signalement.status === SignalementStatus.REJECTED) {
      bucket.rejected += 1;
    }
  }

  return Array.from(grouped.entries()).map(([date, values]) => ({
    date: new Date(`${date}T00:00:00Z`).toLocaleDateString("fr-FR", {
      month: "short",
      day: "numeric",
    }),
    total: values.total,
    validated: values.validated,
    inProgress: values.inProgress,
    pending: values.pending,
    rejected: values.rejected,
  }));
}

export async function getRecentSignalements(user?: JwtPayload) {
  const orgFilter = user ? getSignalementOrgFilter(user) : {};
  return prisma.signalement.findMany({
    where: orgFilter,
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      victim: true,
      cyberViolence: true,
      assignedTo: {
        include: {
          organization: true,
        },
      },
      platforms: {
        include: {
          platform: true,
        },
      },
    },
  });
}

export async function getRecentActivity(user?: JwtPayload) {
  const orgFilter = user ? getSignalementOrgFilter(user) : {};
  const signalements = await prisma.signalement.findMany({
    where: orgFilter,
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: {
      assignedTo: {
        include: {
          organization: true,
        },
      },
      platforms: {
        include: {
          platform: true,
        },
      },
    },
  });

  return signalements.map((signalement, index) => {
    const signalementLabel = `SIG-${signalement.id}`;
    const isAssigned = signalement.assignedTo.length > 0;
    const hasPlatformReport = signalement.platforms.length > 0;

    if (index === 0 && hasPlatformReport) {
      return {
        id: `activity-${signalement.id}`,
        type: "PLATFORM_REPORT",
        title: `Platform report sent for ${signalementLabel}`,
        description: `A report was generated for ${signalement.platforms[0]?.platform?.name ?? "a monitored platform"}.`,
        timestamp: new Date(signalement.updatedAt).toLocaleString(),
        entityId: signalement.id,
        status: signalement.status,
        user: { name: "System Automation", avatar: "" },
      };
    }

    if (isAssigned) {
      return {
        id: `activity-${signalement.id}`,
        type: "ASSIGNED",
        title: `Case assigned to ${signalement.assignedTo[0]?.organization?.name ?? "an organization"}`,
        description: `${signalementLabel} is now assigned for follow-up.`,
        timestamp: new Date(
          signalement.assignedTo[0]?.createdAt ?? signalement.updatedAt,
        ).toLocaleString(),
        entityId: signalement.id,
        status: signalement.status,
        user: { name: "Case Manager", avatar: "" },
      };
    }

    return {
      id: `activity-${signalement.id}`,
      type: "CREATED",
      title: `New case created: ${signalementLabel}`,
      description: signalement.description ?? "A new report was submitted.",
      timestamp: new Date(signalement.createdAt).toLocaleString(),
      entityId: signalement.id,
      status: signalement.status,
      user: { name: "Portal", avatar: "" },
    };
  });
}
