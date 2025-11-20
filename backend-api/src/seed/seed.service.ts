import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || '123456';
    const adminName = process.env.DEFAULT_ADMIN_NAME || 'Admin Default';

    const userExists = await this.usersService.findByEmail(adminEmail);

    if (userExists) {
      this.logger.log(`✅ Usuário Admin já existe: ${adminEmail}`);
      return;
    }

    this.logger.log(`🚀 Criando usuário Admin padrão: ${adminEmail}...`);
    
    await this.usersService.create({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
    });

    this.logger.log('✨ Usuário Admin criado com sucesso!');
  }
}