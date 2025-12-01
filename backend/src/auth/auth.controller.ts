import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ApiOperation({
    summary: 'Autenticar usuário',
    description:
      'Realiza login do usuário e retorna um token JWT para acesso aos endpoints protegidos',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Credenciais do usuário',
    examples: {
      adminUser: {
        summary: '👤 Usuário administrador',
        description: 'Exemplo de login de administrador',
        value: {
          email: 'admin@example.com',
          password: '123456',
        },
      },
      usuarioValido: {
        summary: '✅ Credenciais válidas',
        description: 'Exemplo de login com credenciais corretas',
        value: {
          email: 'joao.silva@example.com',
          password: 'senha123',
        },
      },
      outroUsuario: {
        summary: '✅ Outro usuário válido',
        description: 'Exemplo com outro usuário',
        value: {
          email: 'maria.santos@example.com',
          password: 'minhaSenha456',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: LoginResponseDto,
    schema: {
      example: {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvYW8uc2lsdmFAZXhhbXBsZS5jb20iLCJzdWIiOiI2NzVjOGE5ZjhkNGUyZjFhM2I1YzZkN2UiLCJpYXQiOjE3MzMyNDcwMDAsImV4cCI6MTczMzI1MDYwMH0.abc123xyz',
        user: {
          _id: '675c8a9f8d4e2f1a3b5c6d7e',
          name: 'João Silva',
          email: 'joao.silva@example.com',
          createdAt: '2024-11-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
    schema: {
      example: {
        statusCode: 401,
        message: 'Email ou senha inválidos',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'Precisa ter um e-mail válido',
          'O email não pode ser vazío',
          'A senha precisa estar em texto',
          'A senha não pode ser vazia',
        ],
        error: 'Bad Request',
      },
    },
  })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
