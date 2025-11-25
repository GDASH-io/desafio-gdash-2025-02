import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';

@Injectable()
export class UsersInitService implements OnModuleInit {
  private readonly logger = new Logger(UsersInitService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createDefaultUser();
  }

  private async createDefaultUser() {
    try {
      const defaultEmail = this.configService.get<string>('DEFAULT_USER_EMAIL', 'admin@example.com');
      const defaultPassword = this.configService.get<string>('DEFAULT_USER_PASSWORD', '123456');
      const defaultUsername = this.configService.get<string>('DEFAULT_USER_USERNAME', 'Admin');

      // Verificar se o usuário padrão já existe
      const existingUser = await this.usersService.findByEmail(defaultEmail);
      
      if (existingUser) {
        this.logger.log(`Default user already exists: ${defaultEmail}`);
        return;
      }

      // Criar usuário padrão
      const defaultUser: CreateUserDto = {
        name: defaultUsername,
        email: defaultEmail,
        password: defaultPassword,
      };

      await this.usersService.create(defaultUser);
      this.logger.log(`✓ Default user created successfully: ${defaultEmail}`);
      this.logger.log(`  Username: ${defaultUsername}`);
      this.logger.log(`  Email: ${defaultEmail}`);
      this.logger.log(`  Password: ${defaultPassword}`);
    } catch (error) {
      this.logger.error(`Failed to create default user: ${error.message}`);
    }
  }
}
