import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class IngestApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers || {};

    let token: string | undefined;
    const xKey = headers['x-api-key'];
    if (typeof xKey === 'string') {
      token = xKey;
    } else if (Array.isArray(xKey) && xKey.length > 0) {
      token = xKey[0];
    }

    if (!token) {
      const auth = headers['authorization'];
      if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
        token = auth.slice(7);
      }
    }

    const expected = process.env.INGEST_API_KEY || '';
    if (!expected) {
      return false;
    }
    return typeof token === 'string' && token === expected;
  }
}
