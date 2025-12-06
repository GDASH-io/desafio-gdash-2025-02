import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private usersService: UsersService) {}

  async seedDefaultUser() {
    try {
      const existingUser =
        await this.usersService.findByEmail('admin@example.com');
      if (existingUser) {
        this.logger.log('Usuário padrão já existe');
        return;
      }

      await this.usersService.create({
        email: 'admin@example.com',
        password: '123456',
        name: 'Administrador',
        role: 'admin',
      });

      this.logger.log('Usuário padrão criado: admin@example.com / 123456');
    } catch (error) {
      this.logger.error('Erro ao criar usuário padrão', error);
    }
  }
}
