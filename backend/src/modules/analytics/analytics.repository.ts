import { logger } from "../../config/logger";
import { prisma } from "../../config/prisma";
import {
  SignalementStatus,
  Priority,
  Titulaire,
  AccompanimentType,
} from "../../generated/prisma/enums";

export interface AnalyticsFilterParams {
  dateFrom?: Date;
  dateTo?: Date;
  prevDateFrom?: Date;
  prevDateTo?: Date;
  status?: SignalementStatus;
  priority?: Priority;
  cyberViolenceId?: number;
  platformId?: number;
  organizationId?: number;
  titulaire?: Titulaire;
  accompanimentType?: AccompanimentType;
}

function buildSignalementWhere(params?: AnalyticsFilterParams, usePrevPeriod = false) {
  const where: any = {};

  const from = usePrevPeriod ? params?.prevDateFrom : params?.dateFrom;
  const to = usePrevPeriod ? params?.prevDateTo : params?.dateTo;

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  if (params?.status) {
    where.status = params.status;
  }

  if (params?.priority) {
    where.priority = params.priority;
  }

  if (params?.cyberViolenceId) {
    where.cyberViolenceId = Number(params.cyberViolenceId);
  }

  if (params?.titulaire) {
    where.titulaire = params.titulaire;
  }

  if (params?.platformId) {
    where.reportedItems = {
      some: {
        platformId: Number(params.platformId),
      },
    };
  }

  if (params?.organizationId) {
    where.assignedTo = {
      some: {
        organizationId: Number(params.organizationId),
      },
    };
  }

  if (params?.accompanimentType) {
    if (params.accompanimentType === "SUP") {
      where.platforms = {
        some: {},
      };
    } else {
      where.assignedTo = {
        some: {
          type: params.accompanimentType,
        },
      };
    }
  }

  return where;
}

export async function getOverviewKpis(params?: AnalyticsFilterParams) {
  const whereCurrent = buildSignalementWhere(params, false);
  const wherePrev = buildSignalementWhere(params, true);

  const [
    total,
    pending,
    inProgress,
    validated,
    rejected,
    closed,
    prevTotal,
    prevPending,
    prevInProgress,
    prevValidated,
    prevRejected,
    prevClosed,
  ] = await Promise.all([
    prisma.signalement.count({ where: whereCurrent }),
    prisma.signalement.count({ where: { ...whereCurrent, status: SignalementStatus.PENDING } }),
    prisma.signalement.count({ where: { ...whereCurrent, status: SignalementStatus.IN_PROGRESS } }),
    prisma.signalement.count({ where: { ...whereCurrent, status: SignalementStatus.VALIDATED } }),
    prisma.signalement.count({ where: { ...whereCurrent, status: SignalementStatus.REJECTED } }),
    prisma.signalement.count({ where: { ...whereCurrent, status: SignalementStatus.CLOSED } }),

    prisma.signalement.count({ where: wherePrev }),
    prisma.signalement.count({ where: { ...wherePrev, status: SignalementStatus.PENDING } }),
    prisma.signalement.count({ where: { ...wherePrev, status: SignalementStatus.IN_PROGRESS } }),
    prisma.signalement.count({ where: { ...wherePrev, status: SignalementStatus.VALIDATED } }),
    prisma.signalement.count({ where: { ...wherePrev, status: SignalementStatus.REJECTED } }),
    prisma.signalement.count({ where: { ...wherePrev, status: SignalementStatus.CLOSED } }),
  ]);

  const calcDiff = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Number((((curr - prev) / prev) * 100).toFixed(1));
  };

  return {
    total: { count: total, diff: calcDiff(total, prevTotal) },
    pending: { count: pending, diff: calcDiff(pending, prevPending) },
    inProgress: { count: inProgress, diff: calcDiff(inProgress, prevInProgress) },
    validated: { count: validated, diff: calcDiff(validated, prevValidated) },
    rejected: { count: rejected, diff: calcDiff(rejected, prevRejected) },
    closed: { count: closed, diff: calcDiff(closed, prevClosed) },
  };
}

export async function getTimeSeries(params?: AnalyticsFilterParams) {
  const where = buildSignalementWhere(params, false);

  const signalements = await prisma.signalement.findMany({
    where,
    select: {
      createdAt: true,
      status: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const timeMap = new Map<string, { total: number; validated: number; inProgress: number; pending: number; closed: number; rejected: number }>();

  for (const sig of signalements) {
    const key = sig.createdAt.toISOString().slice(0, 10);
    const existing = timeMap.get(key) || { total: 0, validated: 0, inProgress: 0, pending: 0, closed: 0, rejected: 0 };
    existing.total += 1;
    if (sig.status === SignalementStatus.VALIDATED) existing.validated += 1;
    if (sig.status === SignalementStatus.IN_PROGRESS) existing.inProgress += 1;
    if (sig.status === SignalementStatus.PENDING) existing.pending += 1;
    if (sig.status === SignalementStatus.CLOSED) existing.closed += 1;
    if (sig.status === SignalementStatus.REJECTED) existing.rejected += 1;
    timeMap.set(key, existing);
  }

  return Array.from(timeMap.entries()).map(([date, counts]) => ({
    date,
    ...counts,
  }));
}

export async function getStatusDistribution(params?: AnalyticsFilterParams) {
  const where = buildSignalementWhere(params, false);
  const grouped = await prisma.signalement.groupBy({
    by: ["status"],
    where,
    _count: { status: true },
  });

  return grouped.map((g) => ({
    status: g.status,
    count: g._count.status,
  }));
}

export async function getPriorityDistribution(params?: AnalyticsFilterParams) {
  const where = buildSignalementWhere(params, false);
  const grouped = await prisma.signalement.groupBy({
    by: ["priority"],
    where,
    _count: { priority: true },
  });

  return grouped.map((g) => ({
    priority: g.priority,
    count: g._count.priority,
  }));
}

export async function getCyberViolenceDistribution(params?: AnalyticsFilterParams) {
  const where = buildSignalementWhere(params, false);

  const signalements = await prisma.signalement.findMany({
    where,
    select: {
      cyberViolenceId: true,
      otherCyberViolence: true,
      cyberViolence: {
        select: { id: true, name: true },
      },
    },
  });

  const countMap = new Map<string, number>();

  for (const s of signalements) {
    const name = s.cyberViolence?.name || s.otherCyberViolence || "Autre";
    countMap.set(name, (countMap.get(name) || 0) + 1);
  }

  return Array.from(countMap.entries()).map(([name, count]) => ({
    name,
    count,
  })).sort((a, b) => b.count - a.count);
}

export async function getPlatformAnalysis(params?: AnalyticsFilterParams) {
  const platforms = await prisma.platform.findMany({
    orderBy: { name: "asc" },
  });

  const reportedItemWhere: any = {};
  if (params?.dateFrom || params?.dateTo) {
    reportedItemWhere.createdAt = {};
    if (params.dateFrom) reportedItemWhere.createdAt.gte = params.dateFrom;
    if (params.dateTo) reportedItemWhere.createdAt.lte = params.dateTo;
  }

  if (params?.organizationId) {
    reportedItemWhere.signalement = {
      assignedTo: {
        some: { organizationId: Number(params.organizationId) },
      },
    };
  }

  const grouped = await prisma.reportedItem.groupBy({
    by: ["platformId"],
    where: reportedItemWhere,
    _count: { platformId: true },
  });

  const countMap = new Map<number, number>();
  for (const g of grouped) {
    countMap.set(g.platformId, g._count.platformId);
  }

  return platforms.map((p) => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
    count: countMap.get(p.id) || 0,
  })).sort((a, b) => b.count - a.count);
}

export async function getPlatformReportAnalysis(params?: AnalyticsFilterParams) {
  const where: any = {};
  if (params?.dateFrom || params?.dateTo) {
    where.createdAt = {};
    if (params.dateFrom) where.createdAt.gte = params.dateFrom;
    if (params.dateTo) where.createdAt.lte = params.dateTo;
  }

  if (params?.organizationId) {
    where.signalement = {
      assignedTo: {
        some: { organizationId: Number(params.organizationId) },
      },
    };
  }

  const [total, pending, sent, processing, closed, rejected, reportsByPlatform] = await Promise.all([
    prisma.platformReport.count({ where }),
    prisma.platformReport.count({ where: { ...where, status: "PENDING" } }),
    prisma.platformReport.count({ where: { ...where, status: "SENT" } }),
    prisma.platformReport.count({ where: { ...where, status: "PROCESSING" } }),
    prisma.platformReport.count({ where: { ...where, status: "CLOSED" } }),
    prisma.platformReport.count({ where: { ...where, status: "REJECTED" } }),
    prisma.platformReport.findMany({
      where,
      include: {
        platform: {
          select: { id: true, name: true, icon: true },
        },
      },
    }),
  ]);

  const platformMap = new Map<number, { platformId: number; name: string; icon: string | null; pending: number; sent: number; processing: number; closed: number; rejected: number; total: number }>();

  for (const r of reportsByPlatform) {
    const pid = r.platformId;
    const existing = platformMap.get(pid) || {
      platformId: pid,
      name: r.platform.name,
      icon: r.platform.icon,
      pending: 0,
      sent: 0,
      processing: 0,
      closed: 0,
      rejected: 0,
      total: 0,
    };

    existing.total += 1;
    if (r.status === "PENDING") existing.pending += 1;
    if (r.status === "SENT") existing.sent += 1;
    if (r.status === "PROCESSING") existing.processing += 1;
    if (r.status === "CLOSED") existing.closed += 1;
    if (r.status === "REJECTED") existing.rejected += 1;

    platformMap.set(pid, existing);
  }

  return {
    overview: { total, pending, sent, processing, closed, rejected },
    byPlatform: Array.from(platformMap.values()),
  };
}

export async function getAccompanimentAnalysis(params?: AnalyticsFilterParams) {
  const whereSignalement = buildSignalementWhere(params, false);

  const [juridiqueCount, psychiqueCount, supCount] = await Promise.all([
    prisma.assignedTo.count({
      where: {
        type: AccompanimentType.JUR,
        signalement: whereSignalement,
      },
    }),
    prisma.assignedTo.count({
      where: {
        type: AccompanimentType.PSY,
        signalement: whereSignalement,
      },
    }),
    prisma.platformReport.count({
      where: {
        signalement: whereSignalement,
      },
    }),
  ]);

  return [
    { type: "JUR", label: "Juridique", count: juridiqueCount },
    { type: "PSY", label: "Psychique", count: psychiqueCount },
    { type: "SUP", label: "Support Technique (Platform Reports)", count: supCount },
  ];
}

export async function getOrganizationAnalysis(params?: AnalyticsFilterParams) {
  const organizations = await prisma.organization.findMany({
    where: params?.organizationId ? { id: Number(params.organizationId) } : undefined,
    select: {
      id: true,
      nickname: true,
      name: true,
      category: true,
      image: true,
    },
  });

  const assignedWhere: any = {};
  if (params?.dateFrom || params?.dateTo) {
    assignedWhere.createdAt = {};
    if (params.dateFrom) assignedWhere.createdAt.gte = params.dateFrom;
    if (params.dateTo) assignedWhere.createdAt.lte = params.dateTo;
  }

  if (params?.organizationId) {
    assignedWhere.organizationId = Number(params.organizationId);
  }

  const grouped = await prisma.assignedTo.groupBy({
    by: ["organizationId"],
    where: assignedWhere,
    _count: { organizationId: true },
  });

  const countMap = new Map<number, number>();
  for (const g of grouped) {
    countMap.set(g.organizationId, g._count.organizationId);
  }

  return organizations.map((org) => ({
    id: org.id,
    nickname: org.nickname,
    name: org.name,
    category: org.category,
    image: org.image,
    count: countMap.get(org.id) || 0,
  })).sort((a, b) => b.count - a.count);
}

export async function getTitulaireAnalysis(params?: AnalyticsFilterParams) {
  const where = buildSignalementWhere(params, false);

  const [moiMeme, autrePersonne, total] = await Promise.all([
    prisma.signalement.count({ where: { ...where, titulaire: Titulaire.MOI_MEME } }),
    prisma.signalement.count({ where: { ...where, titulaire: Titulaire.AUTRE_PERSONNE } }),
    prisma.signalement.count({ where }),
  ]);

  const moiMemePct = total > 0 ? Number(((moiMeme / total) * 100).toFixed(1)) : 0;
  const autrePersonnePct = total > 0 ? Number(((autrePersonne / total) * 100).toFixed(1)) : 0;

  return [
    { key: "MOI_MEME", label: "Moi-même (Oui)", count: moiMeme, percentage: moiMemePct },
    { key: "AUTRE_PERSONNE", label: "Autre personne (Non)", count: autrePersonne, percentage: autrePersonnePct },
  ];
}

export async function getTreatmentStatusAnalysis(params?: AnalyticsFilterParams) {
  const assignedWhere: any = {};
  if (params?.dateFrom || params?.dateTo) {
    assignedWhere.createdAt = {};
    if (params.dateFrom) assignedWhere.createdAt.gte = params.dateFrom;
    if (params.dateTo) assignedWhere.createdAt.lte = params.dateTo;
  }

  if (params?.organizationId) {
    assignedWhere.organizationId = Number(params.organizationId);
  }

  const grouped = await prisma.assignedTo.groupBy({
    by: ["status"],
    where: assignedWhere,
    _count: { status: true },
  });

  return grouped.map((g) => ({
    status: g.status,
    count: g._count.status,
  }));
}

export async function getApprovalAnalysis(params?: AnalyticsFilterParams) {
  const where = buildSignalementWhere(params, false);

  const [validated, rejected, pending] = await Promise.all([
    prisma.signalement.count({ where: { ...where, status: SignalementStatus.VALIDATED } }),
    prisma.signalement.count({ where: { ...where, status: SignalementStatus.REJECTED } }),
    prisma.signalement.count({ where: { ...where, status: SignalementStatus.PENDING } }),
  ]);

  const evaluated = validated + rejected;
  const approvalRate = evaluated > 0 ? Number(((validated / evaluated) * 100).toFixed(1)) : 0;

  return {
    validated,
    rejected,
    pending,
    approvalRate,
  };
}

export async function getProcessingTimeMetrics(params?: AnalyticsFilterParams) {
  const where = buildSignalementWhere(params, false);

  const signalements = await prisma.signalement.findMany({
    where,
    select: {
      createdAt: true,
      dateAnalyse: true,
      dateApprobation: true,
      updatedAt: true,
      status: true,
    },
  });

  let totalClosureTimeMs = 0;
  let closedCount = 0;

  let totalAnalyseTimeMs = 0;
  let analysedCount = 0;

  let totalApprobationTimeMs = 0;
  let approvedCount = 0;

  for (const s of signalements) {
    if (s.dateAnalyse) {
      const diff = s.dateAnalyse.getTime() - s.createdAt.getTime();
      if (diff >= 0) {
        totalAnalyseTimeMs += diff;
        analysedCount += 1;
      }
    }

    if (s.dateApprobation) {
      const diff = s.dateApprobation.getTime() - s.createdAt.getTime();
      if (diff >= 0) {
        totalApprobationTimeMs += diff;
        approvedCount += 1;
      }
    }

    if (s.status === SignalementStatus.CLOSED || s.status === SignalementStatus.VALIDATED) {
      const end = s.dateApprobation || s.updatedAt;
      const diff = end.getTime() - s.createdAt.getTime();
      if (diff >= 0) {
        totalClosureTimeMs += diff;
        closedCount += 1;
      }
    }
  }

  const formatDuration = (ms: number) => {
    if (ms <= 0) return "—";
    const hours = Math.round(ms / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return remHours > 0 ? `${days}j ${remHours}h` : `${days}j`;
  };

  return {
    avgProcessingTime: formatDuration(closedCount > 0 ? totalClosureTimeMs / closedCount : 0),
    avgAnalyseTime: formatDuration(analysedCount > 0 ? totalAnalyseTimeMs / analysedCount : 0),
    avgApprobationTime: formatDuration(approvedCount > 0 ? totalApprobationTimeMs / approvedCount : 0),
  };
}

export async function getRecentActivity(params?: AnalyticsFilterParams, limit = 10) {
  const where = buildSignalementWhere(params, false);

  return prisma.signalement.findMany({
    where,
    include: {
      victim: true,
      cyberViolence: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
