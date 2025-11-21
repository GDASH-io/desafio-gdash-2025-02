import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private usersService: UsersService) {}

  async onModuleInit() {
    await this.seedDefaultAdmin();
  }

  async seedDefaultAdmin() {
    try {
      const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@gdash.com';
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123456';

      const existingUser = await this.usersService.findByEmail(defaultEmail);

      if (!existingUser) {
        await this.usersService.create({
          email: defaultEmail,
          password: defaultPassword,
          name: 'Admin GDASH',
        });

        this.logger.log(`✅ Usuário padrão criado: ${defaultEmail}`);
        this.logger.log(`🔑 Senha: ${defaultPassword}`);
      } else {
        this.logger.log(`ℹ️ Usuário padrão já existe: ${defaultEmail}`);
      }
    } catch (error) {
      this.logger.error(`❌ Erro ao criar usuário padrão: ${error.message}`);
    }
  }
}