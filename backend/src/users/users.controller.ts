import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  async create(@Body() createUserDto: CreateUserDto) {
    console.log('[backend][users] POST /users - Creating user');
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso' })
  async findAll() {
    console.log('[backend][users] GET /users - Fetching all users');
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@Param('id') id: string) {
    console.log('[backend][users] GET /users/:id - Fetching user:', id);
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar informações do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou tentativa de alterar último admin' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    console.log('[backend][users] PATCH /users/:id - Updating user:', id);
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Alterar senha do usuário' })
  @ApiResponse({ status: 204, description: 'Senha alterada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async changePassword(@Param('id') id: string, @Body() changePasswordDto: ChangePasswordDto) {
    console.log('[backend][users] PATCH /users/:id/password - Changing password for user:', id);
    await this.usersService.changePassword(id, changePasswordDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir usuário' })
  @ApiResponse({ status: 204, description: 'Usuário excluído com sucesso' })
  @ApiResponse({ status: 400, description: 'Não é possível excluir o último administrador' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async remove(@Param('id') id: string) {
    console.log('[backend][users] DELETE /users/:id - Deleting user:', id);
    await this.usersService.remove(id);
  }

  @Put(':id/theme')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar preferência de tema do usuário' })
  @ApiResponse({ status: 200, description: 'Tema atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado - você só pode atualizar seu próprio tema' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async updateTheme(@Param('id') id: string, @Body() updateThemeDto: UpdateThemeDto, @Request() req: any) {
    console.log('[backend][users] PUT /users/:id/theme - Updating theme for user:', id);
    // Verificar se o usuário pode atualizar (próprio usuário ou admin)
    const currentUser = req.user;
    const userId = (currentUser._id || currentUser.id)?.toString();
    const isOwnUser = userId === id;
    const isAdmin = currentUser.role === 'admin';

    if (!isOwnUser && !isAdmin) {
      throw new HttpException(
        'Você só pode atualizar seu próprio tema',
        HttpStatus.FORBIDDEN
      );
    }

    const updatedUser = await this.usersService.updateTheme(id, updateThemeDto.theme);
    return { theme: updatedUser.theme };
  }

  @Get(':id/theme')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obter preferência de tema do usuário' })
  @ApiResponse({ status: 200, description: 'Tema retornado com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado - você só pode consultar seu próprio tema' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getTheme(@Param('id') id: string, @Request() req: any) {
    console.log('[backend][users] GET /users/:id/theme - Fetching theme for user:', id);
    // Verificar se o usuário pode consultar (próprio usuário ou admin)
    const currentUser = req.user;
    const userId = (currentUser._id || currentUser.id)?.toString();
    const isOwnUser = userId === id;
    const isAdmin = currentUser.role === 'admin';

    if (!isOwnUser && !isAdmin) {
      throw new HttpException(
        'Você só pode consultar seu próprio tema',
        HttpStatus.FORBIDDEN
      );
    }

    return this.usersService.getTheme(id);
  }
}

