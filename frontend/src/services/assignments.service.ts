import { api } from './api';
import type { AssignedTo } from '../types';

export interface CreateAssignmentDto {
  signalementId: number;
  organizationId: number;
  type?: 'SUP' | 'PSY' | 'JUR';
  reason?: string;
}

export interface UpdateAssignmentDto {
  status?: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CLOSED' | 'REJECTED';
  reason?: string;
  notes?: string | null;
  reportActions?: string | null;
  reportObservations?: string | null;
  reportResult?: string | null;
  reportRecommendations?: string | null;
}

export interface AssignmentQueryParams {
  search?: string;
  organizationId?: number;
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAssignments {
  items: AssignedTo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const AssignmentsService = {
  async getAssignments(params?: AssignmentQueryParams): Promise<PaginatedAssignments> {
    const { data } = await api.get<any>('/assigned-tos', { params });
    if (Array.isArray(data)) {
      return { items: data, total: data.length, page: 1, limit: data.length || 20, totalPages: 1 };
    }
    return {
      items: data.items || [],
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 20,
      totalPages: data.totalPages || 1,
    };
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
