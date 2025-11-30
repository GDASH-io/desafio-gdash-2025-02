import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { EncryptService } from 'src/modules/encrypt/encrypt.service';
import { commonConstants } from 'src/shared/constants';
import { JwtPayload, UserRole } from 'src/types';
import { IS_PUBLIC_KEY } from '../decorators/IsPublic';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly encryptService: EncryptService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      commonConstants.decorators.ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException('Invalid Token');

    try {
      const payload = this.encryptService.verifyAuthToken<JwtPayload>(token);
      const role = payload.role;
      request.user = payload;
      if (requiredRoles && requiredRoles.length > 0) {
        if (!role) {
          throw new ForbiddenException(
            'Você não tem permissão para acessar este recurso',
          );
        }

        const hasRole = requiredRoles.includes(role);

        if (!hasRole) {
          throw new ForbiddenException(
            'Acesso negado: você não tem permissão para acessar este recurso',
          );
        }
      }
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw new UnauthorizedException(error.message);
      }

      throw new UnauthorizedException('Invalid or expired Token');
    }

    return true;
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return undefined;
    }
    return token;
  }
}
