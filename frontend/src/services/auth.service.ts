import { api } from './api';
import type { User } from '../types';

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
  return data;
}

export async function resetPassword(email: string) : Promise<{message:string}>{
  const {data} = await api.post<{message:string}>('/auth/reset-password',{email});
  return data;
}