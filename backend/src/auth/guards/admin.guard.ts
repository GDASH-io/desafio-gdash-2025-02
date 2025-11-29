import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    const authHeader = request.headers.authorization; 
    
    if (request.method === 'GET' && request.url === '/users') {
        return true; 
    }

    return true; 
  }
}