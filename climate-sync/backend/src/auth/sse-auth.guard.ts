import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SseAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(SseAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    // Tenta pegar token de múltiplas fontes
    let token = request.query.token;
    
    // Se não veio via query, tenta o header Authorization
    if (!token) {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    this.logger.log(`🔍 SSE Auth - Token recebido: ${token ? 'Sim' : 'Não'}`);
    
    if (!token) {
      this.logger.error('❌ Token não fornecido');
      throw new UnauthorizedException('Token não fornecido');
    }

    try {
      // Pega a secret do ConfigService (mesma do JwtModule)
      const secret = this.configService.get<string>('JWT_SECRET') || 'secretKey';
      
      this.logger.log(`🔑 Usando secret: ${secret.substring(0, 10)}...`);
      
      const payload = this.jwtService.verify(token, { secret });
      
      this.logger.log(`✅ SSE Auth - Token válido para: ${payload.email || payload.username}`);
      
      // Anexa o usuário ao request para uso posterior
      request.user = payload;
      
      return true;
    } catch (error) {
      this.logger.error(`❌ SSE Auth - Erro: ${error.message}`);
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}