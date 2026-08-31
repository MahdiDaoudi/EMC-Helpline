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

  async updateProfile(dto: ProfileUpdateDto, imageFile?: File | null): Promise<User> {
    if (imageFile) {
      const formData = new FormData();
      if (dto.firstName) formData.append("firstName", dto.firstName);
      if (dto.lastName) formData.append("lastName", dto.lastName);
      if (dto.email) formData.append("email", dto.email);
      formData.append("image", imageFile);

      const { data } = await api.patch<User>("/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    }

    const { data } = await api.patch<User>("/profile", dto);
    return data;
  },

  async changePassword(dto: ChangePasswordDto): Promise<void> {
    await api.patch("/profile/password", dto);
  },
};
