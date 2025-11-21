import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthResponseType } from '@repo/shared'
import * as bcrypt from 'bcryptjs'

import { UsersService } from '../users/users.service'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseType> {
    this.logger.log(`Login attempt for email: ${dto.email}`)
    const user = await this.usersService.findByEmail(dto.email)
    if (!user) {
      this.logger.warn(`Login failed: user not found for email ${dto.email}`)
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!isPasswordValid) {
      this.logger.warn(`Login failed: invalid password for email ${dto.email}`)
      throw new UnauthorizedException('Invalid credentials')
    }

    const payload = { sub: user._id.toString(), email: user.email, role: user.role }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    })

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    })

    this.logger.log(`Login successful for user: ${user.email} (${user.role})`)

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    }
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    this.logger.debug('Token refresh attempt')
    try {
      const payload = this.jwtService.verify(refreshToken)
      const newAccessToken = this.jwtService.sign(
        { sub: payload.sub, email: payload.email, role: payload.role },
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
      )
      this.logger.debug(`Token refreshed for user: ${payload.email}`)
      return { accessToken: newAccessToken }
    } catch {
      this.logger.warn('Token refresh failed: invalid refresh token')
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async getMe(userId: string) {
    this.logger.debug(`Getting user profile for id: ${userId}`)
    return this.usersService.findById(userId)
  }
}
