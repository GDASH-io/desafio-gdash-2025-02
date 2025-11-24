export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  name?: string;
}
