import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserDocument } from './schemas/user.schema';
import { hashPassword } from '../utils/hash-password';
import { userSchema } from './validation/create-user.schema';
import { z } from 'zod';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() userData: User): Promise<UserDocument> {
    const result = userSchema.safeParse(userData);

    if (!result.success) {
      throw new BadRequestException(z.treeifyError(result.error));
    }

    const existingUser = await this.usersService.findUserByEmail(
      userData.email,
    );

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await hashPassword(userData.password);
    return this.usersService.createUser({
      ...userData,
      password: hashedPassword,
    });
  }

  @Get()
  async getUsers(): Promise<UserDocument[]> {
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserDocument> {
    const user = await this.usersService.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() userData: User,
  ): Promise<UserDocument> {
    const result = userSchema.safeParse(userData);

    if (!result.success) {
      throw new BadRequestException(z.treeifyError(result.error));
    }

    const hashedPassword = await hashPassword(userData.password);

    const updatedUser = await this.usersService.updateUser(id, {
      ...userData,
      password: hashedPassword,
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    const deletedUser = await this.usersService.deleteUser(id);
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }
}
