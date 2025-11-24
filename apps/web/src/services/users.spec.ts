import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/lib/api'

import { createUser, deleteUser, fetchUserById, fetchUsers, updateUser } from './users'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('users service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('fetchUsers', () => {
    it('should fetch users with pagination', async () => {
      const mockResponse = {
        data: {
          items: [{ _id: '1', name: 'Test', email: 'test@test.com' }],
          total: 1,
          page: 1,
          limit: 10,
        },
      }
      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await fetchUsers(1, 10)

      expect(api.get).toHaveBeenCalledWith('/api/users', { params: { page: 1, limit: 10 } })
      expect(result).toEqual(mockResponse.data)
    })

    it('should use default pagination values', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { items: [] } })

      await fetchUsers()

      expect(api.get).toHaveBeenCalledWith('/api/users', { params: { page: 1, limit: 10 } })
    })
  })

  describe('fetchUserById', () => {
    it('should fetch user by id', async () => {
      const mockUser = { _id: '123', name: 'Test', email: 'test@test.com' }
      vi.mocked(api.get).mockResolvedValue({ data: mockUser })

      const result = await fetchUserById('123')

      expect(api.get).toHaveBeenCalledWith('/api/users/123')
      expect(result).toEqual(mockUser)
    })
  })

  describe('createUser', () => {
    it('should create a new user', async () => {
      const newUser = { name: 'New User', email: 'new@test.com', password: '123456' }
      const mockResponse = { _id: '1', ...newUser }
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await createUser(newUser)

      expect(api.post).toHaveBeenCalledWith('/api/users', newUser)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateUser', () => {
    it('should update existing user', async () => {
      const updateData = { name: 'Updated Name' }
      const mockResponse = { _id: '1', name: 'Updated Name', email: 'test@test.com' }
      vi.mocked(api.put).mockResolvedValue({ data: mockResponse })

      const result = await updateUser('1', updateData)

      expect(api.put).toHaveBeenCalledWith('/api/users/1', updateData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteUser', () => {
    it('should delete user by id', async () => {
      vi.mocked(api.delete).mockResolvedValue({})

      await deleteUser('123')

      expect(api.delete).toHaveBeenCalledWith('/api/users/123')
    })
  })
})
