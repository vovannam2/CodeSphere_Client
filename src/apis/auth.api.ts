import apiClient from './apiClient';
import type { DataResponse } from '@/types/common.types';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/auth.types';

interface UserProfileResponse {
  id: number;
  email: string;
  username: string;
  role: string;
  avatar?: string;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<DataResponse<AuthResponse>>('/auth/register', data);
    return response.data.data!;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<DataResponse<AuthResponse>>('/auth/login', data);
    return response.data.data!;
  },

  googleAuth: async (): Promise<string> => {
    const response = await apiClient.get<DataResponse<string>>('/auth/google');
    return response.data.data!;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<DataResponse<UserProfileResponse>>('/users/me/profile');
    const profile = response.data.data!;
    return {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      role: profile.role,
      avatar: profile.avatar,
    };
  },
};

