import { api } from './api';
import type { Validate } from '../types';

export interface CreateValidationDto {
  signalementId: number;
  userId: number;
  type: 'TECHNICIAN' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
}

export interface UpdateValidationDto {
  type?: 'TECHNICIAN' | 'ADMIN';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string;
}

export const ValidationsService = {
  async getValidations(): Promise<Validate[]> {
    const { data } = await api.get<Validate[]>('/validates');
    return data;
  },

  async getValidation(signalementId: number, userId: number): Promise<Validate> {
    const { data } = await api.get<Validate>(`/validates/${signalementId}/${userId}`);
    return data;
  },

  async createValidation(dto: CreateValidationDto): Promise<Validate> {
    const { data } = await api.post<Validate>('/validates', dto);
    return data;
  },

  async updateValidation(
    signalementId: number,
    userId: number,
    dto: UpdateValidationDto
  ): Promise<Validate> {
    const { data } = await api.patch<Validate>(`/validates/${signalementId}/${userId}`, dto);
    return data;
  },

  async deleteValidation(signalementId: number, userId: number): Promise<void> {
    await api.delete(`/validates/${signalementId}/${userId}`);
  },
};
