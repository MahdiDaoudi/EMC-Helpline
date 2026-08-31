import { api } from "./api";
import type { Role, RoleName } from "../types";

export interface CreateRoleDto {
  name: RoleName;
  description: string;
}

export type UpdateRoleDto = Partial<CreateRoleDto>;

export const RolesService = {
  async getRoles(): Promise<Role[]> {
    const { data } = await api.get<Role[]>("/roles");
    return data;
  },

  async getRoleById(id: number): Promise<Role> {
    const { data } = await api.get<Role>(`/roles/${id}`);
    return data;
  },

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const { data } = await api.post<Role>("/roles", dto);
    return data;
  },

  async updateRole(id: number, dto: UpdateRoleDto): Promise<Role> {
    const { data } = await api.patch<Role>(`/roles/${id}`, dto);
    return data;
  },

  async deleteRole(id: number): Promise<void> {
    await api.delete(`/roles/${id}`);
  },
};
