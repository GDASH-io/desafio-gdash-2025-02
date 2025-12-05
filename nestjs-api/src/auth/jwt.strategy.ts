import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, SetMetadata } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_KEY_CLIMATEMPO_NEVER_USE_HARDCODED_SECRET_IN_PROD';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ('admin' | 'user')[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class JwtAuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const authHeader = request.headers.authorization as string | undefined;
		const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;

		if (!token) throw new HttpException('Token de autenticação ausente.', HttpStatus.UNAUTHORIZED);

		try {
			const payload = jwt.verify(token, SECRET) as any;
			request.user = payload;
			return true;
		} catch (e) {
			throw new HttpException('Token de autenticação inválido.', HttpStatus.UNAUTHORIZED);
		}
	}
}

@Injectable()
export class RolesGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const handler = context.getHandler();
		const roles = Reflect.getMetadata(ROLES_KEY, handler) as ('admin' | 'user')[] | undefined;
		if (!roles || roles.length === 0) return true;
		const request = context.switchToHttp().getRequest();
		const user = request.user as { role?: string } | undefined;
		return !!user && !!user.role && roles.includes(user.role as any);
	}
}
