import { apiClient } from "@/lib/api-client";
import { AuthResponse, LoginRequest, RegisterRequest } from "../types";

export const authService = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', data);

        return response.data
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', data);

        return response.data
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/api/v1/users/me');
        return response.data;
    },
};