import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users.service';

@Injectable()
export class UsersSeedProvider implements OnModuleInit {
  private readonly logger = new Logger(UsersSeedProvider.name);

  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      this.logger.warn('ADMIN_EMAIL/ADMIN_PASSWORD não definidos. Seed admin pulado.');
      return;
    }

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      this.logger.log(`Admin já existe: ${email}`);
      return;
    }

    await this.usersService.create({ email, password, role: 'admin' });
    this.logger.log(`Admin criado: ${email}`);
  }
}
