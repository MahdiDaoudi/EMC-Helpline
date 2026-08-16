import { api } from './api';
import type { Victim } from '../types';

export interface CreateVictimDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  telephone?: string;
  sex: 'MALE' | 'FEMALE';
  ageGroup: 'CHILD_5_12' | 'TEEN_13_17' | 'YOUNG_ADULT_18_25' | 'ADULT_26_PLUS';
  city?: string;
}

export type UpdateVictimDto = Partial<CreateVictimDto>;

export interface GetVictimsParams {
  search?: string;
}

export const VictimsService = {
  async getVictims(params?: GetVictimsParams): Promise<Victim[]> {
    const { data } = await api.get<Victim[]>('/victims', { params });
    return data;
  },

  async getVictimById(id: number): Promise<Victim> {
    const { data } = await api.get<Victim>(`/victims/${id}`);
    return data;
  },

  async createVictim(dto: CreateVictimDto): Promise<Victim> {
    const { data } = await api.post<Victim>('/victims', dto);
    return data;
  },

  async updateVictim(id: number, dto: UpdateVictimDto): Promise<Victim> {
    const { data } = await api.patch<Victim>(`/victims/${id}`, dto);
    return data;
  },

  async deleteVictim(id: number): Promise<void> {
    await api.delete(`/victims/${id}`);
  },
};
