import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';
import { UsersService } from '../users.service';
import { hashPassword } from '../../utils/hash-password';
import { Role } from '../enums/role.enum';

@Injectable()
export class AdminInitService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminInitService.name);

  constructor(
    private usersService: UsersService,
    @InjectConnection() private connection: Connection,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.waitForConnection();

      const adminEmail = process.env.ADMIN_EMAIL!;
      const adminPassword = process.env.ADMIN_PASSWORD!;

      const existingAdmin = await this.usersService.findUserByEmail(adminEmail);

      if (!existingAdmin) {
        const hashedPassword = await hashPassword(adminPassword);
        await this.usersService.createUser({
          email: adminEmail,
          password: hashedPassword,
          role: Role.ADMIN,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to initialize admin user: ${errorMessage}`);
    }
  }

  private async waitForConnection(
    maxRetries = 30,
    delay = 1000,
  ): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      if (this.connection.readyState === ConnectionStates.connected) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    throw new Error('MongoDB connection timeout');
  }
}
