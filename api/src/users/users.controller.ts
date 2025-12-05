import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import {
  type UpdateUserDto,
  CreateUserDto,
  UserPublicDto,
  PaginatedUsersResponseDto,
} from './dto/user.dto';
import type { IRequest, IUserPublic } from './interface/user.interface';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @ApiOperation({
    summary:
      'Criar um novo usuário (Requer privilégio ADMIN para definir role)',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso.',
    type: UserPublicDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação ou email já cadastrado.',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDTO: CreateUserDto) {
    return this.userService.create(createUserDTO);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar usuários com paginação (Apenas para Administradores)',
  })
  @ApiQuery({ name: 'page', required: false, example: 1, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de usuários.',
    type: PaginatedUsersResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async findAll(@Query('page') page: string) {
    const pageNumber = parseInt(page) || 1;
    return this.userService.findAll(pageNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID ou Email' })
  @ApiResponse({
    status: 200,
    description: 'Retorna os dados públicos do usuário.',
    type: UserPublicDto,
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async findOne(@Param('id') id: string): Promise<IUserPublic> {
    const user = await this.userService.findByIdOrEmail(id);
    return this.userService.cleanDocument(user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar usuário (Requer ser Admin ou o próprio usuário)',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso.',
    type: UserPublicDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de permissão ou dados inválidos.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto,
    @Req() req: IRequest,
  ) {
    const currentUserRole = req.user.role;
    const currentUserId = req.user.userId;

    return this.userService.update(
      id,
      updateDto,
      currentUserRole,
      currentUserId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar usuário (Apenas Administradores)' })
  @ApiResponse({ status: 204, description: 'Usuário deletado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro de permissão.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: IRequest) {
    const currentUserRole = req.user.role;
    await this.userService.delete(id, currentUserRole);
  }
}
