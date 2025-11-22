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