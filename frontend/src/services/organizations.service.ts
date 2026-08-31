import { api } from './api';
import type { Organization } from '../types';

export interface CreateOrganizationDto {
  nickname: string;
  name: string;
  category: 'JURIDIQUE' | 'PSYCHIQUE';
  email: string;
  website?: string;
  description: string;
  image?: string | null;
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

  async createOrganization(dto: CreateOrganizationDto, file?: File | null): Promise<Organization> {
    if (file) {
      const formData = new FormData();
      Object.entries(dto).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          formData.append(key, val as string);
        }
      });
      formData.append('image', file);
      const { data } = await api.post<Organization>('/organizations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    }
    const { data } = await api.post<Organization>('/organizations', dto);
    return data;
  },

  async updateOrganization(id: number, dto: UpdateOrganizationDto, file?: File | null): Promise<Organization> {
    if (file) {
      const formData = new FormData();
      Object.entries(dto).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          formData.append(key, val as string);
        }
      });
      formData.append('image', file);
      const { data } = await api.patch<Organization>(`/organizations/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    }
    const { data } = await api.patch<Organization>(`/organizations/${id}`, dto);
    return data;
  },

  async deleteOrganization(id: number): Promise<void> {
    await api.delete(`/organizations/${id}`);
  },
};
