import { UserRepository } from '@/domain/aplication/repository/user-repository';
import { User } from '@/domain/enterprise/entities/user';
import { PrismaUserMapper } from '../mappers/prisma-user-mapper';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  async create(user: User): Promise<void> {
    const { id, ...data } = PrismaUserMapper.toPrisma(user);
    await this.prisma.user.create({
      data,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      return null;
    }
    return PrismaUserMapper.toDomain(user);
  }

  async findByUserName(userName: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        userName,
      },
    });
    if (!user) {
      return null;
    }
    return PrismaUserMapper.toDomain(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
      },
    });
    if (!user) {
      return null;
    }
    return PrismaUserMapper.toDomain(user);
  }

  async save(user: User): Promise<void> {
    const { id, ...data } = PrismaUserMapper.toPrisma(user);
    await this.prisma.user.update({
      where: {
        id: user.id.toString(),
      },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id,
      },
    });
  }
}
