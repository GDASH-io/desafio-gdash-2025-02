import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({ summary: 'Cria um usuário padrão' })
  async create(@Body() userData: Partial<any>) {
    return await this.usersService.create(userData);
  }

  @Post('default')
  @ApiOperation({ summary: 'Cria um usuário padrão' })
  async createDefaultUser() {
    return await this.usersService.createDefaultUser();
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários' })
  async findAll() {
    return await this.usersService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário por ID' })
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um usuário' })
  async update(@Param('id') id: string, @Body() userData: Partial<any>) {
    return await this.usersService.update(id, userData);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Remove um usuário' })
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }
}
