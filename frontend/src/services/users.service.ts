import api from '../lib/api';

export interface User {
  _id: string;
  email: string;
  name: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  active?: boolean;
}

export const usersService = {
  async getAll(): Promise<User[]> {
    const response = await api.get<User[]>('/api/users');
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await api.get<User>(`/api/users/${id}`);
    return response.data;
  },

  async create(user: CreateUserDto): Promise<User> {
    const response = await api.post<User>('/api/users', user);
    return response.data;
  },

  async update(id: string, user: UpdateUserDto): Promise<User> {
    const response = await api.patch<User>(`/api/users/${id}`, user);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/users/${id}`);
  },
};

