import apiClient from "./apiClient";

export interface ListUsers {
    id: string;
    email: string;
    role: 'admin' | 'user';
    createdAt: string;
}

export interface UpdateUser{
    email?: string;
    password?: string;
    role?: 'admin' | 'user';
}

export interface CreateUser{
    email: string;
    password: string;
    role?: 'admin' | 'user';
}

export const usersService = {
    create: async (data: CreateUser): Promise<ListUsers> => {
        const response = await apiClient.post<ListUsers>('/users', data);
        return response.data;
    },

    getUsers: async (): Promise<ListUsers[]> => {
        const response =  await apiClient.get<ListUsers[]>('/users');
        return response.data;
    },

    update: async (id: string, data: UpdateUser): Promise<ListUsers> => {
        const response = await apiClient.patch<ListUsers>(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    }
}

export default usersService;