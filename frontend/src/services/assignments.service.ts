import { api } from './api';
import type { AssignedTo } from '../types';

export interface CreateAssignmentDto {
  signalementId: number;
  organizationId: number;
  type?: 'SUP' | 'PSY' | 'JUR';
}

export interface UpdateAssignmentDto {
  status?: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  reason?: string;
}

export const AssignmentsService = {
  async getAssignments(): Promise<AssignedTo[]> {
    const { data } = await api.get<AssignedTo[]>('/assigned-tos');
    return data;
  },

  async getAssignment(signalementId: number, organizationId: number): Promise<AssignedTo> {
    const { data } = await api.get<AssignedTo>(`/assigned-tos/${signalementId}/${organizationId}`);
    return data;
  },

  async createAssignment(dto: CreateAssignmentDto): Promise<AssignedTo> {
    const { data } = await api.post<AssignedTo>('/assigned-tos', dto);
    return data;
  },

  async updateAssignment(
    signalementId: number,
    organizationId: number,
    dto: UpdateAssignmentDto
  ): Promise<AssignedTo> {
    const { data } = await api.patch<AssignedTo>(
      `/assigned-tos/${signalementId}/${organizationId}`,
      dto
    );
    return data;
  },

  async deleteAssignment(signalementId: number, organizationId: number): Promise<void> {
    await api.delete(`/assigned-tos/${signalementId}/${organizationId}`);
  },
};
