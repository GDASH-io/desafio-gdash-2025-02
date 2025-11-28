import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, NotFoundException, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const user = await this.usersService.findOne(id);
        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }
        return user;
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Patch('me/password')
    async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
        const userId = req.user?.sub || req.user?._id?.toString() || req.user?.id;
        await this.usersService.changePassword(userId, dto.oldPassword, dto.newPassword);
        return { message: 'Senha alterada com sucesso' };
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}