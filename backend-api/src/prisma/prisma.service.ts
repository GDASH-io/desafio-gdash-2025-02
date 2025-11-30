import { INestApplication, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Prisma Client conectado ao banco de dados.');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Prisma Client desconectado do banco de dados.');
  }
}