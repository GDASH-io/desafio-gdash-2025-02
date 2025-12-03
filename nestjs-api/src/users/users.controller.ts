import { Controller, Post, Body, Get, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard, RolesGuard } from '../auth/jwt.strategy';
import { Roles } from '../auth/jwt.strategy';

interface CreateUserDto {
	username: string;
	password: string;
	role?: 'admin' | 'user';
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	async create(@Body() dto: CreateUserDto) {
		return this.usersService.create(dto);
	}

	@Get()
	async findAll() {
		return this.usersService.findAll();
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() update: Partial<CreateUserDto>) {
		return this.usersService.update(id, update);
	}

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}