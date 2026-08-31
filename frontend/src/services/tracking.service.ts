import { api } from './api';
import type { CreateSignalementDto } from '../types';

export interface VictimSignalement {
  id: number;
  reference?: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'VALIDATED' | 'REJECTED' | 'CLOSED';
  priority: string;
  issuer: string;
  titulaire: string;
  createdAt: string;
  updatedAt: string;
  dateAnalyse: string | null;
  dateApprobation: string | null;
  otherCyberViolence: string | null;
  cyberViolence?: {
    id: number;
    name: string;
  } | null;
  accompaniments?: Array<{ type: string }>;
  assignedTo?: Array<{
    organizationId: number;
    type: string;
    status: string;
    createdAt: string;
    organization?: {
      id: number;
      nickname: string;
      name: string;
    } | null;
  }>;
  validate?: Array<{
    type: string;
    status: string;
    reason?: string | null;
    createdAt: string;
  }>;
  reportedItems?: Array<{
    id: number;
    contentUrl: string;
    type: string;
    platform?: {
      id: number;
      name: string;
      icon?: string | null;
    } | null;
    screenshots?: Array<{
      id: number;
      imageUrl: string;
    }>;
  }>;
}

export const trackingService = {
  async accessTracking(referenceNumber: string, password: string) {
    const response = await api.post<{ token: string; referenceNumber: string }>(
      '/victims/tracking/access',
      { referenceNumber, password }
    );
    return response.data;
  },

  async getVictimSignalements() {
    const response = await api.get<VictimSignalement[]>('/victims/tracking/signalements');
    return response.data;
  },

  async getVictimSignalementById(id: number | string) {
    const response = await api.get<VictimSignalement>(`/victims/tracking/signalements/${id}`);
    return response.data;
  },

  async createVictimSignalement(
    data: CreateSignalementDto,
    filesByReportedItem: File[][] = []
  ) {
    const formData = new FormData();
    formData.append('payload', JSON.stringify(data));

    filesByReportedItem.forEach((files, index) => {
      files.forEach((file) => {
        formData.append(`screenshots[${index}]`, file);
      });
    });

    const response = await api.post<VictimSignalement>(
      '/victims/tracking/signalements',
      formData
    );
    return response.data;
  },

  async logout() {
    try {
      await api.post('/victims/tracking/logout');
    } catch {
      // ignore
    }
  },
};
