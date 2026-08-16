import { api } from "./api";
import type {
  Signalement,
  DashboardStats,
  TimeSeriesData,
  RecentActivityItem,
} from "../types";

export const DashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>("/dashboard/stats");
    return data;
  },

  async getTimeSeriesData(range: string = "30d"): Promise<TimeSeriesData[]> {
    const { data } = await api.get<TimeSeriesData[]>(
      `/dashboard/timeseries?range=${range}`,
    );
    return data;
  },

  async getRecentSignalements(): Promise<Signalement[]> {
    const { data } = await api.get<Signalement[]>("/dashboard/recent");
    return data;
  },

  async getRecentActivity(): Promise<RecentActivityItem[]> {
    const { data } = await api.get<RecentActivityItem[]>("/dashboard/activity");
    return data;
  },

  async getSignalements(params?: {
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<Signalement[]> {
    const { data } = await api.get<Signalement[]>("/signalements", { params });
    return data;
  },

  async getSignalementById(id: number): Promise<Signalement | null> {
    const { data } = await api.get<Signalement | null>(`/signalements/${id}`);
    return data;
  },
};
