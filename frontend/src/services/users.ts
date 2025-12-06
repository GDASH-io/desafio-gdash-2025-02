import api from './api'

export interface User {
  _id?: string
  id?: string
  email: string
  name: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UpdateUserDto {
  email?: string
  password?: string
  name?: string
}

export const usersService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<{ success: boolean; data: User[] }>('/users')
    return response.data.data || response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ success: boolean; data: User }>('/users/me')
    return response.data.data || response.data
  },

  async updateCurrentUser(updateData: UpdateUserDto): Promise<User> {
    const response = await api.patch<{ success: boolean; data: User }>('/users/me', updateData)
    return response.data.data || response.data
  },

  async deleteCurrentUser(): Promise<void> {
    await api.delete('/users/me')
  },
}

