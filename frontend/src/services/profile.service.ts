import { api } from "./api";
import type { User } from "../types";

export interface ProfileUpdateDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string | null;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ProfileService = {
  async getProfile(): Promise<User> {
    const { data } = await api.get<User>("/profile");
    return data;
  },

  async updateProfile(dto: ProfileUpdateDto): Promise<User> {
    const { data } = await api.patch<User>("/profile", dto);
    return data;
  },

  async changePassword(dto: ChangePasswordDto): Promise<void> {
    await api.patch("/profile/password", dto);
  },
};
