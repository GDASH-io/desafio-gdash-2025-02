import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  RegistryLog,
  RegistryLogDocument,
} from '../schemas/registryLog.schema';
import { Model } from 'mongoose';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  constructor(
    @InjectModel(RegistryLog.name) private logModel: Model<RegistryLogDocument>,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', async () => {
      const { statusCode } = res;
      const duration = Date.now() - start;

      // Tenta pegar o usuário (se a rota for protegida pelo AuthGuard)
      // Nota: Em rotas públicas, req['user'] será undefined
      const user = req['user'] as any;

      // 1. Log no Terminal (Visual)
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} - ${duration}ms ${user ? `[User: ${user.email}]` : ''}`,
      );

      // 2. Salvar no MongoDB (Persistência)
      try {
        await this.logModel.create({
          method,
          url: originalUrl,
          statusCode,
          duration,
          ip,
          userId: user?.userId || null, // Pega do JWT decodificado
          userEmail: user?.email || null,
        });
      } catch (error) {
        this.logger.error('Falha ao salvar log no Mongo', error);
      }
    });

    next();
  }
}
