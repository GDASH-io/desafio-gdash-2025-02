import api from './api';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role?: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  password?: string;
  role?: string;
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const usersService = {
  getAll: async (page: number = 1, limit: number = 10): Promise<UsersResponse> => {
    const response = await api.get<UsersResponse>('/users', { params: { page, limit } });
    return response.data;
  },
  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },
  create: async (data: CreateUserDto): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },
  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

