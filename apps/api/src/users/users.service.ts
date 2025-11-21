import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { PaginatedResponseType, UserRoleEnum, UserType } from '@repo/shared'
import * as bcrypt from 'bcryptjs'
import { Model } from 'mongoose'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './user.schema'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async seedAdminUser(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
    const adminPassword = process.env.ADMIN_PASSWORD || '123456'

    const existingAdmin = await this.userModel.findOne({ email: adminEmail })
    if (existingAdmin) {
      this.logger.log('Admin user already exists')
      return
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10)
    await this.userModel.create({
      name: 'Admin',
      email: adminEmail,
      passwordHash,
      role: UserRoleEnum.ADMIN,
    })

    this.logger.log(`Admin user created: ${adminEmail}`)
  }

  async create(dto: CreateUserDto): Promise<UserType> {
    this.logger.log(`Creating user: ${dto.email}`)
    const existing = await this.userModel.findOne({ email: dto.email })
    if (existing) {
      this.logger.warn(`User creation failed: email ${dto.email} already in use`)
      throw new ConflictException('Email already in use')
    }

    const passwordHash = await bcrypt.hash(dto.password, 10)
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role || UserRoleEnum.USER,
    })

    this.logger.log(`User created: ${user.email} (${user.role})`)
    return this.toUserType(user)
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponseType<UserType>> {
    const skip = (page - 1) * limit
    const [users, total] = await Promise.all([
      this.userModel.find().skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(),
    ])

    return {
      items: users.map((user) => this.toUserType(user)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: string): Promise<UserType> {
    const user = await this.userModel.findById(id)
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return this.toUserType(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email })
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserType> {
    this.logger.log(`Updating user: ${id}`)
    const user = await this.userModel.findById(id)
    if (!user) {
      this.logger.warn(`User update failed: user ${id} not found`)
      throw new NotFoundException('User not found')
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userModel.findOne({ email: dto.email })
      if (existing) {
        this.logger.warn(`User update failed: email ${dto.email} already in use`)
        throw new ConflictException('Email already in use')
      }
    }

    const updateData: Partial<User> = {}
    if (dto.name) updateData.name = dto.name
    if (dto.email) updateData.email = dto.email
    if (dto.role) updateData.role = dto.role
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10)
    }

    const updated = await this.userModel.findByIdAndUpdate(id, updateData, {
      new: true,
    })
    this.logger.log(`User updated: ${updated!.email}`)
    return this.toUserType(updated!)
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting user: ${id}`)
    const result = await this.userModel.findByIdAndDelete(id)
    if (!result) {
      this.logger.warn(`User deletion failed: user ${id} not found`)
      throw new NotFoundException('User not found')
    }
    this.logger.log(`User deleted: ${result.email}`)
  }

  private toUserType(user: User): UserType {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }
  }
}
