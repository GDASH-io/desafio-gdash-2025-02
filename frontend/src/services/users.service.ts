import api from './api';
import type { User } from '@/types';

interface CreateUserDto {
  email: string;
  password: string;
  name: string;
}

interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
}

export const usersService = {
  async getAll(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  async getById(id: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  async create(userData: CreateUserDto): Promise<User> {
    const { data } = await api.post<User>('/users', userData);
    return data;
  },

  async update(id: string, userData: UpdateUserDto): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, userData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};