import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users;
  }

  @Get('me')
  async getProfile(@Request() req: any) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Usuário não encontrado no token');
    }
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return user;
  }

  @Patch('me')
  async updateProfile(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Usuário não encontrado no token');
    }
    const updatedUser = await this.usersService.update(userId, updateUserDto);
    return updatedUser;
  }

  @Delete('me')
  async deleteProfile(@Request() req: any) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Usuário não encontrado no token');
    }
    await this.usersService.remove(userId);
    return { message: 'Usuário excluído com sucesso' };
  }
}

