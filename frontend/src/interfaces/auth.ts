export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password2: string;
  avatar?: File | null;
}

export interface RegisterResponse {
  message: string;
  user: unknown;
  token: string;
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  errors?: Record<string, string | string[]>;
  detail?: string | Record<string, unknown>;
  [key: string]: unknown;
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}