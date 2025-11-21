import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`📝 Novo registro: ${createUserDto.email}`);
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    this.logger.log(`🔐 Login tentado: ${loginUserDto.email}`);
    return this.usersService.login(loginUserDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    this.logger.log(`👤 Perfil acessado: ${req.user._id}`);
    return req.user;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    this.logger.log('📊 Listando todos os usuários');
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    this.logger.log(`🔍 Buscando usuário: ${id}`);
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log(`✏️ Atualizando usuário: ${id}`);
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    this.logger.log(`🗑️ Deletando usuário: ${id}`);
    return this.usersService.remove(id);
  }
}