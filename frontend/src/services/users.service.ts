import { api } from "./api";
import type { User } from "../types";

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
  organizationId?: number | null;
  profileImageUrl?: string | null;
  isActive?: boolean;
  isLocked?: boolean;
}

export type UpdateUserDto = Partial<CreateUserDto>;

export const UsersService = {
  async getUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>("/users");
    return data;
  },

  async getUserById(id: number): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  async createUser(dto: CreateUserDto): Promise<User> {
    const { data } = await api.post<User>("/users", dto);
    return data;
  },

  async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, dto);
    return data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
