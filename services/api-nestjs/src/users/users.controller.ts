import { Body, Controller, Get, Post, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, ResponseUserDto } from 'src/DTO/user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';


//@UseGuards(JwtAuthGuard)
@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Post()
    async createUser(@Body() usuarioData: CreateUserDto): Promise<ResponseUserDto> {
        const user = await this.usersService.createUser(usuarioData);
        return user;
    }

    @Put(':id')
    async updateUser(
        @Param('id') id: string,
        @Body() usuarioData: Partial<CreateUserDto>
    ): Promise<ResponseUserDto> {
        const user = await this.usersService.updateUser(id, usuarioData);
        return user;
    }

    @Get()
    async getUsers(): Promise<ResponseUserDto[]> {
        const users = await this.usersService.getAllUsers();
        return users;
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string): Promise<void> {
        await this.usersService.deleteUser(id);
    }
}