import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UsersService } from '../users/users.service'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  let authService: AuthService
  let usersService: UsersService
  let jwtService: JwtService

  const mockUser = {
    _id: { toString: () => 'user-id-123' },
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: '',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    mockUser.passwordHash = await bcrypt.hash('password123', 10)

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: vi.fn(),
            findById: vi.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: vi.fn().mockReturnValue('mock-token'),
            verify: vi.fn(),
          },
        },
      ],
    }).compile()

    authService = module.get<AuthService>(AuthService)
    usersService = module.get<UsersService>(UsersService)
    jwtService = module.get<JwtService>(JwtService)
  })

  describe('login', () => {
    it('should return tokens and user on successful login', async () => {
      vi.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any)

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
      expect(result.user.email).toBe('test@example.com')
    })

    it('should throw UnauthorizedException when user not found', async () => {
      vi.spyOn(usersService, 'findByEmail').mockResolvedValue(null)

      await expect(
        authService.login({ email: 'notfound@example.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException on invalid password', async () => {
      vi.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any)

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('refresh', () => {
    it('should return new access token on valid refresh token', async () => {
      vi.spyOn(jwtService, 'verify').mockReturnValue({
        sub: 'user-id',
        email: 'test@example.com',
        role: 'USER',
      })

      const result = await authService.refresh('valid-refresh-token')

      expect(result).toHaveProperty('accessToken')
    })

    it('should throw UnauthorizedException on invalid refresh token', async () => {
      vi.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token')
      })

      await expect(authService.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })

  describe('getMe', () => {
    it('should return user by id', async () => {
      const userType = {
        id: 'user-id-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      vi.spyOn(usersService, 'findById').mockResolvedValue(userType as any)

      const result = await authService.getMe('user-id-123')

      expect(result.id).toBe('user-id-123')
    })
  })
})
