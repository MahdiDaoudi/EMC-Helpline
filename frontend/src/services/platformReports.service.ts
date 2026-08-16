import { api } from "./api";
import type { PlatformReport } from "../types";

export interface CreatePlatformReportDto {
  signalementId: number;
  platformId: number;
  emailSubject: string;
  emailBody: string;
  emailTo: string;
  selectedScreenshotUrls?: string[];
}

export interface UpdatePlatformReportDto {
  status?: "PENDING" | "SENT" | "PROCESSING" | "CLOSED" | "REJECTED";
  closedAt?: string | null;
}

export const PlatformReportsService = {
  async getPlatformReports(): Promise<PlatformReport[]> {
    const { data } = await api.get<PlatformReport[]>("/platforms-reports");
    return data;
  },

  async getPlatformReport(
    signalementId: number,
    platformId: number,
  ): Promise<PlatformReport> {
    const { data } = await api.get<PlatformReport>(
      `/platforms-reports/${signalementId}/${platformId}`,
    );
    return data;
  },

  async createPlatformReport(
    dto: CreatePlatformReportDto,
  ): Promise<PlatformReport> {
    const { data } = await api.post<PlatformReport>("/platforms-reports", dto);
    return data;
  },

  async updatePlatformReport(
    signalementId: number,
    platformId: number,
    dto: UpdatePlatformReportDto,
  ): Promise<PlatformReport> {
    const { data } = await api.patch<PlatformReport>(
      `/platforms-reports/${signalementId}/${platformId}`,
      dto,
    );
    return data;
  },

  async deletePlatformReport(
    signalementId: number,
    platformId: number,
  ): Promise<void> {
    await api.delete(`/platforms-reports/${signalementId}/${platformId}`);
  },
};
