import * as analyticsRepository from "./analytics.repository";
import { createSignedUrl } from "../../services/supabaseStorage.service";

export interface AnalyticsQueryInput {
  period?: "today" | "7days" | "30days" | "3months" | "year" | "custom";
  dateFrom?: string;
  dateTo?: string;
  status?: any;
  priority?: any;
  cyberViolenceId?: number;
  platformId?: number;
  organizationId?: number;
  titulaire?: any;
  accompanimentType?: any;
}

function computeDateBoundaries(input: AnalyticsQueryInput) {
  const now = new Date();
  let dateFrom: Date | undefined;
  let dateTo: Date | undefined = new Date();

  const period = input.period || "30days";

  if (period === "today") {
    dateFrom = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
  } else if (period === "7days") {
    dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "30days") {
    dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (period === "3months") {
    dateFrom = new Date(
      now.getFullYear(),
      now.getMonth() - 3,
      now.getDate(),
      0,
      0,
      0,
      0,
    );
  } else if (period === "year") {
    dateFrom = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  } else if (period === "custom") {
    if (input.dateFrom) dateFrom = new Date(input.dateFrom);
    if (input.dateTo) {
      dateTo = new Date(input.dateTo);
      dateTo.setHours(23, 59, 59, 999);
    }
  }

  // Calculate previous equivalent period for KPI comparison
  let prevDateFrom: Date | undefined;
  let prevDateTo: Date | undefined;

  if (dateFrom && dateTo) {
    const durationMs = dateTo.getTime() - dateFrom.getTime();
    prevDateTo = new Date(dateFrom.getTime() - 1);
    prevDateFrom = new Date(prevDateTo.getTime() - durationMs);
  }

  return {
    dateFrom,
    dateTo,
    prevDateFrom,
    prevDateTo,
    status: input.status,
    priority: input.priority,
    cyberViolenceId: input.cyberViolenceId
      ? Number(input.cyberViolenceId)
      : undefined,
    platformId: input.platformId ? Number(input.platformId) : undefined,
    organizationId: input.organizationId
      ? Number(input.organizationId)
      : undefined,
    titulaire: input.titulaire,
    accompanimentType: input.accompanimentType,
  };
}

export async function getAnalyticsDashboard(input: AnalyticsQueryInput) {
  const params = computeDateBoundaries(input);

  const [
    kpis,
    timeSeries,
    statusDistribution,
    priorityDistribution,
    cyberViolenceDistribution,
    platformAnalysis,
    platformReportAnalysis,
    accompanimentAnalysis,
    organizationAnalysis,
    titulaireAnalysis,
    treatmentStatusAnalysis,
    approvalAnalysis,
    processingTimeMetrics,
    recentActivity,
  ] = await Promise.all([
    analyticsRepository.getOverviewKpis(params),
    analyticsRepository.getTimeSeries(params),
    analyticsRepository.getStatusDistribution(params),
    analyticsRepository.getPriorityDistribution(params),
    analyticsRepository.getCyberViolenceDistribution(params),
    analyticsRepository.getPlatformAnalysis(params),
    analyticsRepository.getPlatformReportAnalysis(params),
    analyticsRepository.getAccompanimentAnalysis(params),
    analyticsRepository.getOrganizationAnalysis(params),
    analyticsRepository.getTitulaireAnalysis(params),
    analyticsRepository.getTreatmentStatusAnalysis(params),
    analyticsRepository.getApprovalAnalysis(params),
    analyticsRepository.getProcessingTimeMetrics(params),
    analyticsRepository.getRecentActivity(params),
  ]);

  // Enrich platform icons with signed URLs if stored in Supabase
  const enrichedPlatforms = await Promise.all(
    platformAnalysis.map(async (p) => {
      let icon = p.icon;

      if (icon && icon.startsWith("supabase://")) {
        const rawPath = icon.replace(/^supabase:\/\/[^/]+\//, "");

        const signed = await createSignedUrl(rawPath);

        if (signed) {
          icon = signed;
        }
      }

      return {
        ...p,
        icon,
      };
    }),
  );

  // Enrich organization images with signed URLs if stored in Supabase
  const enrichedOrganizations = await Promise.all(
    organizationAnalysis.map(async (org) => {
      let image = org.image;

      if (image && image.startsWith("supabase://")) {
        const rawPath = image.replace(/^supabase:\/\/[^/]+\//, "");

        const signed = await createSignedUrl(rawPath);

        if (signed) {
          image = signed;
        }
      }

      return {
        ...org,
        image,
      };
    }),
  );

  return {
    kpis,
    timeSeries,
    statusDistribution,
    priorityDistribution,
    cyberViolenceDistribution,

    platforms: enrichedPlatforms,

    platformReports: platformReportAnalysis,

    accompaniment: accompanimentAnalysis,

    organizations: enrichedOrganizations,

    titulaire: titulaireAnalysis,

    treatmentStatus: treatmentStatusAnalysis,

    approval: approvalAnalysis,

    processingTimes: processingTimeMetrics,

    recentActivity,
  };
}
