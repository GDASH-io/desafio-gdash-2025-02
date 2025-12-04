import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Logger,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    this.logger.log('🆕 POST /api/users - Criando usuário');
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  async getMe(@Request() req) {
    this.logger.log('👤 GET /api/users/me - Buscando usuário logado');
    this.logger.log(`Req.user: ${JSON.stringify(req.user)}`);
    
    if (!req.user || !req.user.email) {
      this.logger.error('❌ req.user não está definido');
      throw new Error('Usuário não autenticado');
    }
    
    return this.usersService.findByEmail(req.user.email);
  }

  @Get()
  async findAll() {
    this.logger.log('📋 GET /api/users - Listando usuários');
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`🔍 GET /api/users/${id} - Buscando usuário`);
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log(`✏️  PATCH /api/users/${id} - Atualizando usuário`);
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.logger.log(`🗑️  DELETE /api/users/${id} - Removendo usuário`);
    await this.usersService.remove(id);
    return { message: 'Usuário removido com sucesso' };
  }
}
