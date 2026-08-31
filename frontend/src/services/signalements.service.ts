import { api } from "./api";
import type {
  Signalement,
  SignalementsListResponse,
  Titulaire,
  AccompanimentType,
} from "../types";

export interface VictimCredentialPayload {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  telephone?: string | null;
  sex: "MALE" | "FEMALE";
  ageGroup: "CHILD_5_12" | "TEEN_13_17" | "YOUNG_ADULT_18_25" | "ADULT_26_PLUS";
  city?: string | null;
  isAnonymous: boolean;
  referenceNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignalementSuccessResponse {
  id: number;
  description?: string | null;
  status: "PENDING" | "VALIDATED" | "REJECTED" | "IN_PROGRESS" | "CLOSED";
  priority: "NORMAL" | "HIGH" | "URGENT";
  issuer: string;
  titulaire?: Titulaire | null;
  accompaniments?: { id: number; type: AccompanimentType; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
  otherCyberViolence?: string | null;
  victimId: number;
  cyberViolenceId?: number | null;
  victim: VictimCredentialPayload;
  cyberViolence?: {
    id: number;
    name: string;
  } | null;
  reportedItems?: Array<{
    id: number;
    description?: string | null;
    contentUrl: string;
    type: "VIDEO" | "IMAGE" | "PROFILE" | "POST" | "COMMENT" | "PAGE";
    createdAt: string;
    updatedAt: string;
    signalementId: number;
    platformId: number;
    platform?: {
      id: number;
      name: string;
      email: string;
      createdAt: string;
      updatedAt: string;
    };
    screenshots: Array<{ id: number; imageUrl: string; createdAt: string }>;
  }>;
  password: string;
}

export interface CreateSignalementDto {
  description?: string;
  titulaire?: Titulaire;
  accompanimentTypes?: AccompanimentType[];
  otherCyberViolence?: string;
  victimId?: number;
  cyberViolenceId?: number;
  victim?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    telephone?: string;
    sex: "MALE" | "FEMALE";
    ageGroup:
      | "CHILD_5_12"
      | "TEEN_13_17"
      | "YOUNG_ADULT_18_25"
      | "ADULT_26_PLUS";
    city?: string;
  };
  reportedItems: {
    description?: string;
    contentUrl: string;
    type: "VIDEO" | "IMAGE" | "PROFILE" | "POST" | "COMMENT" | "PAGE";
    platformId: number;
    screenshots: { imageUrl: string }[];
  }[];
}

export interface UpdateSignalementDto {
  description?: string;
  status?: "PENDING" | "VALIDATED" | "REJECTED" | "IN_PROGRESS" | "CLOSED";
  priority?: "NORMAL" | "HIGH" | "URGENT";
  dateAnalyse?: string | null;
  reason?: string;
}

export interface GetSignalementsParams {
  search?: string;
  status?: string;
  priority?: string;
  titulaire?: string;
  cyberViolenceId?: number;
  accompanimentType?: string;
  issuer?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export const SignalementsService = {
  async getSignalements(
    params?: GetSignalementsParams,
  ): Promise<SignalementsListResponse> {
    const { data } = await api.get<SignalementsListResponse>("/signalements", {
      params,
    });
    return data;
  },

  async getSignalementById(id: number): Promise<Signalement> {
    const { data } = await api.get<Signalement>(`/signalements/${id}`);
    return data;
  },

  async createSignalement(
    dto: CreateSignalementDto,
    filesByReportedItem: File[][] = [],
  ): Promise<SignalementSuccessResponse> {
    const payload = {
      ...dto,
      reportedItems: (dto.reportedItems || []).map((item) => ({
        ...item,
        screenshots: [],
      })),
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    (filesByReportedItem || []).forEach((files, index) => {
      (files || []).forEach((file) => {
        if (file && typeof File !== "undefined" && file instanceof File) {
          formData.append(`screenshots[${index}]`, file);
        }
      });
    });

    const { data } = await api.post<SignalementSuccessResponse>(
      "/signalements",
      formData,
    );

    return data;
  },

  async createPublicSignalement(
    dto: CreateSignalementDto,
    filesByReportedItem: File[][] = [],
  ): Promise<SignalementSuccessResponse> {
    const payload = {
      ...dto,
      reportedItems: (dto.reportedItems || []).map((item) => ({
        ...item,
        screenshots: [],
      })),
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    (filesByReportedItem || []).forEach((files, index) => {
      (files || []).forEach((file) => {
        if (file && typeof File !== "undefined" && file instanceof File) {
          formData.append(`screenshots[${index}]`, file);
        }
      });
    });

    const { data } = await api.post<SignalementSuccessResponse>(
      "/signalements/public",
      formData,
    );

    return data;
  },

  async updateSignalement(
    id: number,
    dto: UpdateSignalementDto,
  ): Promise<Signalement> {
    const { data } = await api.patch<Signalement>(`/signalements/${id}`, dto);
    return data;
  },

  async deleteSignalement(id: number): Promise<void> {
    await api.delete(`/signalements/${id}`);
  },
};
