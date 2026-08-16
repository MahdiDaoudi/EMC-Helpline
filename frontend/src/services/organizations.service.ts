import { api } from './api';
import type { Organization } from '../types';

export interface CreateOrganizationDto {
  nickname: string;
  name: string;
  email: string;
  website?: string;
  description: string;
}

export type UpdateOrganizationDto = Partial<CreateOrganizationDto>;

export interface GetOrganizationsParams {
  search?: string;
}

export const OrganizationsService = {
  async getOrganizations(params?: GetOrganizationsParams): Promise<Organization[]> {
    const { data } = await api.get<Organization[]>('/organizations', { params });
    return data;
  },

  async getOrganizationById(id: number): Promise<Organization> {
    const { data } = await api.get<Organization>(`/organizations/${id}`);
    return data;
  },

  async createOrganization(dto: CreateOrganizationDto): Promise<Organization> {
    const { data } = await api.post<Organization>('/organizations', dto);
    return data;
  },

  async updateOrganization(id: number, dto: UpdateOrganizationDto): Promise<Organization> {
    const { data } = await api.patch<Organization>(`/organizations/${id}`, dto);
    return data;
  },

  async deleteOrganization(id: number): Promise<void> {
    await api.delete(`/organizations/${id}`);
  },
};
