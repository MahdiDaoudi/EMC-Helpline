import { api } from "./api";
import type { Role } from "../types";

export const RolesService = {
  async getRoles(): Promise<Role[]> {
    const { data } = await api.get<Role[]>("/roles");
    return data;
  },
};
