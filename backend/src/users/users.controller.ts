import { Controller, Post, Body, Get, UseGuards, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserMapper } from './domain/user.mapper';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: any) {
    const result = await this.usersService.create(createUserDto);
    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }
    return UserMapper.toResponse(result.value);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
