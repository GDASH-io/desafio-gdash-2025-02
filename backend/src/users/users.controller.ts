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
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDocument } from './schemas/user.schema';
import { hashPassword } from '../utils/hash-password';
import { userSchema } from './validation/create-user.schema';
import { z } from 'zod';
import { Role } from './enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() userData: CreateUserDto): Promise<UserDocument> {
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
      role: Role.USER,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUsers(): Promise<UserDocument[]> {
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string): Promise<UserDocument> {
    const user = await this.usersService.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() userData: UpdateUserDto,
  ): Promise<UserDocument> {
    const result = userSchema.safeParse(userData);

    if (!result.success) {
      throw new BadRequestException(z.treeifyError(result.error));
    }

    const hashedPassword = await hashPassword(userData.password!);

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
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    const deletedUser = await this.usersService.deleteUser(id);
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }
}
