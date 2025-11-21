import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';

@Injectable()
export class AdminSeedService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');
    const name = this.configService.get<string>('ADMIN_NAME') || 'Admin';
    const role = this.configService.get<string>('ADMIN_ROLE') || 'admin';

    if (!email || !password) {
      this.logger.warn('Admin seed skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set');
      return;
    }

    const existing = await this.usersService.findOneByEmail(email);
    if (existing) {
      this.logger.log(`Admin user already exists: ${email}`);
      return;
    }

    await this.usersService.create({
      name,
      email,
      password,
      role: role as any,
    });

    this.logger.log(`Admin user created with email: ${email}`);
  }
}
