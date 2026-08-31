import { api } from './api';
import type { SignalementStatus, Priority, Titulaire, AccompanimentType, Signalement } from '../types';

export interface AnalyticsQueryFilter {
  period?: 'today' | '7days' | '30days' | '3months' | 'year' | 'custom';
  dateFrom?: string;
  dateTo?: string;
  status?: SignalementStatus;
  priority?: Priority;
  cyberViolenceId?: number;
  platformId?: number;
  organizationId?: number;
  titulaire?: Titulaire;
  accompanimentType?: AccompanimentType;
}

export interface KpiMetric {
  count: number;
  diff: number;
}

export interface OverviewKpis {
  total: KpiMetric;
  pending: KpiMetric;
  inProgress: KpiMetric;
  validated: KpiMetric;
  rejected: KpiMetric;
  closed: KpiMetric;
}

export interface TimeSeriesEntry {
  date: string;
  total: number;
  validated: number;
  inProgress: number;
  pending: number;
  closed: number;
  rejected: number;
}

export interface StatusDistributionEntry {
  status: SignalementStatus;
  count: number;
}

export interface PriorityDistributionEntry {
  priority: Priority;
  count: number;
}

export interface CyberViolenceEntry {
  name: string;
  count: number;
}

export interface PlatformItemEntry {
  id: number;
  name: string;
  icon: string | null;
  count: number;
}

export interface PlatformReportOverview {
  total: number;
  pending: number;
  sent: number;
  processing: number;
  closed: number;
  rejected: number;
}

export interface PlatformReportByPlatform {
  platformId: number;
  name: string;
  icon: string | null;
  pending: number;
  sent: number;
  processing: number;
  closed: number;
  rejected: number;
  total: number;
}

export interface AccompanimentEntry {
  type: string;
  label: string;
  count: number;
}

export interface OrganizationEntry {
  id: number;
  nickname: string;
  name: string;
  category: 'JURIDIQUE' | 'PSYCHIQUE';
  image: string | null;
  count: number;
}

export interface TitulaireEntry {
  key: string;
  label: string;
  count: number;
  percentage: number;
}

export interface TreatmentStatusEntry {
  status: string;
  count: number;
}

export interface ApprovalAnalysis {
  validated: number;
  rejected: number;
  pending: number;
  approvalRate: number;
}

export interface ProcessingTimeMetrics {
  avgProcessingTime: string;
  avgAnalyseTime: string;
  avgApprobationTime: string;
}

export interface AnalyticsResponseData {
  kpis: OverviewKpis;
  timeSeries: TimeSeriesEntry[];
  statusDistribution: StatusDistributionEntry[];
  priorityDistribution: PriorityDistributionEntry[];
  cyberViolenceDistribution: CyberViolenceEntry[];
  platforms: PlatformItemEntry[];
  platformReports: {
    overview: PlatformReportOverview;
    byPlatform: PlatformReportByPlatform[];
  };
  accompaniment: AccompanimentEntry[];
  organizations: OrganizationEntry[];
  titulaire: TitulaireEntry[];
  treatmentStatus: TreatmentStatusEntry[];
  approval: ApprovalAnalysis;
  recentActivity: Signalement[];
}

export const AnalyticsService = {
  async getAnalytics(params?: AnalyticsQueryFilter): Promise<AnalyticsResponseData> {
    const { data } = await api.get<AnalyticsResponseData>('/analytics', { params });
    return data;
  },
};
