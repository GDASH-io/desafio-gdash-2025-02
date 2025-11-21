import { ConflictException, NotFoundException } from '@nestjs/common'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { User } from './user.schema'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService
  let mockUserModel: any

  const mockUser = {
    _id: { toString: () => 'user-id-123' },
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    mockUserModel = {
      findOne: vi.fn(),
      find: vi.fn(),
      findById: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      findByIdAndDelete: vi.fn(),
      create: vi.fn(),
      countDocuments: vi.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  describe('create', () => {
    it('should create a new user', async () => {
      mockUserModel.findOne.mockResolvedValue(null)
      mockUserModel.create.mockResolvedValue(mockUser)

      const result = await service.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.email).toBe('test@example.com')
      expect(result.name).toBe('Test User')
    })

    it('should throw ConflictException when email already exists', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser)

      await expect(
        service.create({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('findById', () => {
    it('should return user by id', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser)

      const result = await service.findById('user-id-123')

      expect(result.id).toBe('user-id-123')
    })

    it('should throw NotFoundException when user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null)

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser)

      const result = await service.findByEmail('test@example.com')

      expect(result?.email).toBe('test@example.com')
    })

    it('should return null when user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null)

      const result = await service.findByEmail('notfound@example.com')

      expect(result).toBeNull()
    })
  })

  describe('findAll', () => {
    it('should return paginated users', async () => {
      mockUserModel.find.mockReturnValue({
        skip: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      })
      mockUserModel.countDocuments.mockResolvedValue(1)

      const result = await service.findAll(1, 10)

      expect(result.items).toHaveLength(1)
      expect(result.meta.total).toBe(1)
    })
  })

  describe('update', () => {
    it('should update user', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser)
      mockUserModel.findByIdAndUpdate.mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
      })

      const result = await service.update('user-id-123', { name: 'Updated Name' })

      expect(result.name).toBe('Updated Name')
    })

    it('should throw NotFoundException when user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null)

      await expect(
        service.update('nonexistent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('delete', () => {
    it('should delete user', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUser)

      await expect(service.delete('user-id-123')).resolves.not.toThrow()
    })

    it('should throw NotFoundException when user not found', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValue(null)

      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
