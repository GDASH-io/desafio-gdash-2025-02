import { Body, Controller, Get, Post, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { UserPublic } from './interfaces/user-public.interface';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() body: CreateUserDto): Promise<UserPublic | { error: string }> {
		if (!body.email || !body.password) {
			return { error: 'email e password são obrigatórios' };
		}
		return this.usersService.create(body);
	}

	@Get()
    @UseGuards(JwtAuthGuard)
    async list(): Promise<UserPublic[]> { 
        return this.usersService.findAll();
	}

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getById(@Param('id') id: string): Promise<UserPublic> {
        return this.usersService.findById(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id') id: string,
        @Body() body: UpdateUserDto
    ): Promise<UserPublic | { error: string }> {
        if (!body || Object.keys(body).length === 0) {
            return { error: 'Informe algum campo para atualizar' };
        }
        return this.usersService.update(id, body);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
        return this.usersService.remove(id);
    }
}
