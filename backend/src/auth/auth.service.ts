import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

/**
 * Serviço de autenticação e autorização
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Registra um novo usuário no sistema
   * O primeiro usuário recebe role 'admin', demais recebem 'user'
   *
   * @param registerDto - Dados de registro (nome, email, senha)
   * @returns Token JWT e dados do usuário
   * @throws HttpException se houver erro no registro
   */
  async register(registerDto: RegisterDto) {
    try {
      // Verificar se é o primeiro usuário do sistema
      const userCount = await this.usersService.count();
      const role = userCount === 0 ? 'admin' : 'user';

      console.log('[backend][auth] Registering user. Total users:', userCount, 'Role assigned:', role);

      const user = await this.usersService.create({
        ...registerDto,
        role,
      });

      const userId = (user as any)._id?.toString() || (user as any).id?.toString();
      const payload = { email: user.email, sub: userId };
      const access_token = this.jwtService.sign(payload);

      console.log('[backend][auth] User registered:', user.email, 'with role:', user.role);
      return {
        access_token,
        user: {
          id: userId,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        console.log('[backend][auth] Registration failed (HttpException):', {
          status: error.getStatus(),
          message: error.message,
          response: error.getResponse(),
        });
        throw error;
      }
      // Log detalhado do erro antes de lançar exceção genérica
      console.error('[backend][auth] Registration failed (unexpected error):', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        registerDto: { ...registerDto, password: '[REDACTED]' }, // Não logar senha
      });
      throw new HttpException('Erro ao registrar usuário', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Autentica um usuário e retorna token JWT
   *
   * @param loginDto - Credenciais de login (email, senha)
   * @returns Token JWT e dados do usuário
   * @throws UnauthorizedException se as credenciais forem inválidas
   */
  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const userId = (user as any)._id?.toString() || (user as any).id?.toString();
    const payload = { email: user.email, sub: userId };
    const access_token = this.jwtService.sign(payload);

    console.log('[backend][auth] User logged in:', user.email);
    return {
      access_token,
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Valida credenciais de usuário (usado pelo Passport JWT Strategy)
   *
   * @param email - Email do usuário
   * @param password - Senha do usuário
   * @returns Dados do usuário (sem senha) ou null se inválido
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user.toObject();
      return result;
    }
    return null;
  }
}

