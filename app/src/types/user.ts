export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: {
    accessToken: string;
    user: User;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: "admin" | "user";
}
