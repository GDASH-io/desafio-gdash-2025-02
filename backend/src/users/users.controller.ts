import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('api/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo usuário',
    description:
      'Registra um novo usuário no sistema. Requer autenticação JWT.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Dados do novo usuário',
    examples: {
      administrador: {
        summary: '👨‍💼 Administrador',
        description: 'Criação de conta de administrador',
        value: {
          name: 'Admin Sistema',
          email: 'admin@sistema.com',
          password: 'admin@2024',
        },
      },
      usuarioComum: {
        summary: '👤 Usuário comum',
        description: 'Exemplo de criação de usuário padrão',
        value: {
          name: 'João Silva',
          email: 'joao.silva@example.com',
          password: 'senha123',
        },
      },
      usuarioCompleto: {
        summary: '✅ Usuário com dados completos',
        description: 'Usuário com informações detalhadas',
        value: {
          name: 'Maria Santos Oliveira',
          email: 'maria.santos@empresa.com.br',
          password: 'senhaSegura456',
        },
      },
      desenvolvedor: {
        summary: '💻 Desenvolvedor',
        description: 'Conta para desenvolvedor',
        value: {
          name: 'Carlos Developer',
          email: 'carlos.dev@tech.com',
          password: 'dev123456',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: UserResponseDto,
    schema: {
      example: {
        _id: '675c8a9f8d4e2f1a3b5c6d7e',
        name: 'João Silva',
        email: 'joao.silva@example.com',
        active: true,
        createdAt: '2024-12-01T14:30:00.000Z',
        updatedAt: '2024-12-01T14:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'Precisa ter um email válido',
          'A senha precisa ser maior ou igual a 6 caracteres',
          'O campo nome não pode ser vazio',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email já cadastrado no sistema',
        error: 'Conflict',
      },
    },
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description:
      'Retorna uma lista com todos os usuários cadastrados no sistema. As senhas não são incluídas na resposta.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    type: [UserResponseDto],
    schema: {
      example: [
        {
          _id: '675c8a9f8d4e2f1a3b5c6d7e',
          name: 'João Silva',
          email: 'joao.silva@example.com',
          active: true,
          createdAt: '2024-11-15T10:30:00.000Z',
          updatedAt: '2024-11-15T10:30:00.000Z',
        },
        {
          _id: '675c8b2a8d4e2f1a3b5c6d7f',
          name: 'Maria Santos',
          email: 'maria.santos@example.com',
          active: true,
          createdAt: '2024-11-20T08:15:00.000Z',
          updatedAt: '2024-11-25T14:20:00.000Z',
        },
        {
          _id: '675c8c5b8d4e2f1a3b5c6d80',
          name: 'Carlos Developer',
          email: 'carlos.dev@tech.com',
          active: false,
          createdAt: '2024-11-10T16:45:00.000Z',
          updatedAt: '2024-11-28T09:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar usuário por ID',
    description:
      'Retorna os dados de um usuário específico pelo seu ID. A senha não é incluída na resposta.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do usuário (MongoDB ObjectId)',
    example: '675c8a9f8d4e2f1a3b5c6d7e',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado',
    type: UserResponseDto,
    schema: {
      example: {
        _id: '675c8a9f8d4e2f1a3b5c6d7e',
        name: 'João Silva',
        email: 'joao.silva@example.com',
        active: true,
        createdAt: '2024-11-15T10:30:00.000Z',
        updatedAt: '2024-12-01T14:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID inválido',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuário com ID 675c8a9f8d4e2f1a3b5c6d7e não encontrado',
        error: 'Not Found',
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar usuário',
    description:
      'Atualiza parcialmente os dados de um usuário existente. Todos os campos são opcionais.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do usuário a ser atualizado',
    example: '675c8a9f8d4e2f1a3b5c6d7e',
    type: String,
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Campos a serem atualizados (todos opcionais)',
    examples: {
      atualizarNome: {
        summary: '📝 Atualizar apenas nome',
        description: 'Modifica apenas o nome do usuário',
        value: {
          name: 'João Silva Santos',
        },
      },
      atualizarEmail: {
        summary: '📧 Atualizar apenas email',
        description: 'Modifica apenas o email do usuário',
        value: {
          email: 'joao.santos@novoemail.com',
        },
      },
      atualizarSenha: {
        summary: '🔒 Atualizar apenas senha',
        description: 'Modifica apenas a senha do usuário',
        value: {
          password: 'novaSenhaSegura789',
        },
      },
      atualizarNomeEmail: {
        summary: '✏️ Atualizar nome e email',
        description: 'Modifica nome e email simultaneamente',
        value: {
          name: 'Maria Santos Oliveira',
          email: 'maria.oliveira@example.com',
        },
      },
      atualizarCompleto: {
        summary: '🔄 Atualização completa',
        description: 'Atualiza todos os campos do usuário',
        value: {
          name: 'Carlos Developer Silva',
          email: 'carlos.silva@newtech.com',
          password: 'superSenha2024',
        },
      },
      desativarUsuario: {
        summary: '🚫 Desativar usuário',
        description: 'Define o usuário como inativo',
        value: {
          active: false,
        },
      },
      reativarUsuario: {
        summary: '✅ Reativar usuário',
        description: 'Reativa um usuário inativo',
        value: {
          active: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
    type: UserResponseDto,
    schema: {
      example: {
        _id: '675c8a9f8d4e2f1a3b5c6d7e',
        name: 'João Silva Santos',
        email: 'joao.silva@example.com',
        active: true,
        createdAt: '2024-11-15T10:30:00.000Z',
        updatedAt: '2024-12-01T15:45:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'email must be an email',
          'password must be longer than or equal to 6 characters',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuário com ID 675c8a9f8d4e2f1a3b5c6d7e não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email já está em uso por outro usuário',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email já cadastrado no sistema',
        error: 'Conflict',
      },
    },
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletar usuário',
    description:
      'Remove permanentemente um usuário do sistema. Esta ação não pode ser desfeita.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do usuário a ser deletado',
    example: '675c8a9f8d4e2f1a3b5c6d7e',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Usuário deletado com sucesso (sem conteúdo na resposta)',
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID inválido',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuário com ID 675c8a9f8d4e2f1a3b5c6d7e não encontrado',
        error: 'Not Found',
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
