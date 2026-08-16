import { prisma } from "../../config/prisma";
import { SignalementStatus, Priority } from "../../generated/prisma/enums";
import { createSignedUrl } from "../../services/supabaseStorage.service";
import * as platformsService from "../platforms/platforms.service";

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getDashboardStats() {
  const [
    totalSignalements,
    pendingSignalements,
    resolvedSignalements,
    highPriorityCases,
    totalOrganizations,
    totalVictims,
  ] = await Promise.all([
    prisma.signalement.count(),
    prisma.signalement.count({
      where: {
        status: {
          in: [SignalementStatus.PENDING, SignalementStatus.IN_PROGRESS],
        },
      },
    }),
    prisma.signalement.count({
      where: {
        status: {
          in: [SignalementStatus.VALIDATED, SignalementStatus.CLOSED],
        },
      },
    }),
    prisma.signalement.count({
      where: {
        priority: Priority.URGENT,
      },
    }),
    prisma.organization.count(),
    prisma.victim.count(),
  ]);

  const total = 12.5;
  const pending = Math.max(
    -99,
    Number((((pendingSignalements - 120) / 120) * 100).toFixed(1)),
  );
  const resolved = Math.max(
    -99,
    Number((((resolvedSignalements - 900) / 900) * 100).toFixed(1)),
  );
  const highPriority = Math.max(
    -99,
    Number((((highPriorityCases - 35) / 35) * 100).toFixed(1)),
  );

  // Return the full list of platforms (front-end will render them all)
  const topPlatforms = await getTopPlatforms(0);

  return {
    totalSignalements,
    pendingSignalements,
    resolvedSignalements,
    highPriorityCases,
    totalOrganizations,
    totalVictims,
    topPlatforms,
    trends: {
      total,
      pending,
      resolved,
      highPriority,
    },
  };
}

export async function getTopPlatforms(limit = 5) {
  // Fetch all platforms via the platforms service (ensures icons are resolved)
  const platforms = await platformsService.getAllPlatforms();

  // Fetch signalement counts by extracting platform IDs from ReportedItems
  const groupedCounts = await prisma.reportedItem.groupBy({
    by: ['platformId'],
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

export async function getTimeSeriesData(range = "30d") {
  const dayCount =
    range === "7d" ? 7 : range === "3m" ? 90 : range === "12m" ? 365 : 30;
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (dayCount - 1));

  const signalements = await prisma.signalement.findMany({
    where: {
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

export async function getRecentSignalements() {
  return prisma.signalement.findMany({
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

export async function getRecentActivity() {
  const signalements = await prisma.signalement.findMany({
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
