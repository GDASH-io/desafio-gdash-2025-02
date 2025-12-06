import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CreateUserUseCase } from "@/domain/application/use-cases/create-user.use-case";

@Injectable()
export class SeedAdminService implements OnModuleInit {
  private readonly logger = new Logger(SeedAdminService.name);

  constructor(
    private createUser: CreateUserUseCase,
    private config: ConfigService
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const adminEmail = this.config.get("ADMIN_EMAIL", "admin@example.com");
    const adminPassword = this.config.get("ADMIN_PASSWORD", "123456");
    const adminName = this.config.get("ADMIN_NAME", "Administrator");

    this.logger.log("Checking if admin user exists...");

    const result = await this.createUser.execute({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });

    if (result.isLeft()) {
      this.logger.log("Admin user already exists");
      return;
    }

    this.logger.log(`Admin user created successfully: ${adminEmail}`);
    this.logger.warn(`Default password: ${adminPassword}`);
    this.logger.warn(
      "⚠️  Please change the default password after first login!"
    );
  }
}
