import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * ThrottlerGuard customizado que ignora o endpoint POST /weather/logs
 * Este endpoint é usado internamente pelo collector/worker e não deve ter rate limiting
 * Também ignora requisições GET para /health (healthcheck)
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Ignorar rate limiting para POST /weather/logs (endpoint interno usado pelo collector/worker)
    // Verificar tanto a URL completa quanto apenas o pathname
    const url = request.url || request.path || '';
    if (request.method === 'POST' && (url === '/weather/logs' || url.startsWith('/weather/logs'))) {
      return true;
    }
    
    // Ignorar rate limiting para GET /health (healthcheck endpoint)
    if (request.method === 'GET' && (url === '/health' || url.startsWith('/health'))) {
      return true;
    }
    
    // Para todos os outros endpoints, usar o comportamento padrão
    return super.canActivate(context) as Promise<boolean>;
  }
}

