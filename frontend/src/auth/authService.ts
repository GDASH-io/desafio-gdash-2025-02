import axios from "axios";

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", { email, password });
  return res.data;
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>("/auth/register", { name, email, password });
  return res.data;
}

export function saveToken(token: string): void {
  localStorage.setItem("token", token);
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function logout(): void {
  localStorage.removeItem("token");
}
