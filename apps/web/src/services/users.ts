import { CreateUserInputType, PaginatedResponseType, UpdateUserInputType, UserType } from '@repo/shared'

import { api } from '@/lib/api'

export async function fetchUsers(page = 1, limit = 10): Promise<PaginatedResponseType<UserType>> {
  const response = await api.get('/api/users', { params: { page, limit } })
  return response.data
}

export async function fetchUserById(id: string): Promise<UserType> {
  const response = await api.get(`/api/users/${id}`)
  return response.data
}

export async function createUser(data: CreateUserInputType): Promise<UserType> {
  const response = await api.post('/api/users', data)
  return response.data
}

export async function updateUser(id: string, data: UpdateUserInputType): Promise<UserType> {
  const response = await api.put(`/api/users/${id}`, data)
  return response.data
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/api/users/${id}`)
}
