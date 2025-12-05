import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // rota não precisa de role específico
    }

    const { user } = context.switchToHttp().getRequest();
    return user && requiredRoles.includes(user.role);
  }
}
