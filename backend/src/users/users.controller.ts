import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserDocument } from './schemas/user.schema';
import { hashPassword } from '../utils/hash-password';
import { createUserSchema } from './validation/create-user.schema';
import { z } from 'zod';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() userData: User): Promise<UserDocument> {
    const result = createUserSchema.safeParse(userData);

    if (!result.success) {
      throw new BadRequestException(z.treeifyError(result.error));
    }

    const existingUser = await this.usersService.findOne(userData.email);

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await hashPassword(userData.password);
    return this.usersService.create({ ...userData, password: hashedPassword });
  }
}
