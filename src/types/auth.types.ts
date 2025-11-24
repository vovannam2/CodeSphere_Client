export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  type: string;
  userId: number;
  email: string;
  username: string;
  role: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  avatar?: string;
}

