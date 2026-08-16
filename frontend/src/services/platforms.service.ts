import { api } from "./api";
import type { Platform } from "../types";

export interface CreatePlatformDto {
  name: string;
  email: string;
  icon?: string | null;
}

export type UpdatePlatformDto = Partial<CreatePlatformDto>;

export const PlatformsService = {
  async getPlatforms(): Promise<Platform[]> {
    const { data } = await api.get<Platform[]>("/platforms");
    return data;
  },

  async getPlatformById(id: number): Promise<Platform> {
    const { data } = await api.get<Platform>(`/platforms/${id}`);
    return data;
  },

  async createPlatform(dto: CreatePlatformDto | FormData): Promise<Platform> {
    const { data } = await api.post<Platform>("/platforms", dto as any);
    return data;
  },

  async updatePlatform(
    id: number,
    dto: UpdatePlatformDto | FormData,
  ): Promise<Platform> {
    const { data } = await api.patch<Platform>(`/platforms/${id}`, dto as any);
    return data;
  },

  async deletePlatform(id: number): Promise<void> {
    await api.delete(`/platforms/${id}`);
  },
};
