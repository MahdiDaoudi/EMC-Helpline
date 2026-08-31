import { api } from "./api";
import type { CyberViolence } from "../types";

export interface CyberViolenceWithCount extends CyberViolence {
  _count?: {
    signalement: number;
  };
}

export const CyberViolencesService = {
  async getAll(): Promise<CyberViolenceWithCount[]> {
    const { data } = await api.get<CyberViolenceWithCount[]>("/cyberviolences");
    return data;
  },

  async getById(id: number): Promise<CyberViolenceWithCount> {
    const { data } = await api.get<CyberViolenceWithCount>(`/cyberviolences/${id}`);
    return data;
  },

  async create(name: string): Promise<CyberViolenceWithCount> {
    const { data } = await api.post<CyberViolenceWithCount>("/cyberviolences", { name });
    return data;
  },

  async update(id: number, name: string): Promise<CyberViolenceWithCount> {
    const { data } = await api.patch<CyberViolenceWithCount>(`/cyberviolences/${id}`, { name });
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/cyberviolences/${id}`);
  },
};
