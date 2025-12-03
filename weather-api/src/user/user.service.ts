import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
      },
    });
    if (!user) {
      throw new NotFoundException();
    }

    return { user };
  }

  async updateUserById(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new NotFoundException();
    }
    const updateUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: updateUserDto.email,
        name: updateUserDto.name,
      },
    });
    return updateUser;
  }

  async deleteUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new NotFoundException();
    }
    return await this.prisma.user.delete({
      where: {
        id: user.id,
      },
    });
  }
}
