import apiClient from "./apiClient";
import axios from "axios";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
    id: string;
    email: string;
    role: 'admin' | 'user';
}

export interface LoginResponse {
  user: User;
}

export const login = async (credentials: LoginCredentials): Promise<User> => {
    try {
        const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
        return response.data.user;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Erro ao tentar fazer login.');
        }
        throw new Error('Não foi possível conectar ao servidor.');
    }
}

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
};


export const checkSession = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get<LoginResponse>('/auth/me');
    return response.data.user;
  } catch (error) {
    
    return null;
  }
};