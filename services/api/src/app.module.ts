import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/gdash',
      }),
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Criar usuário padrão se não existir
    const defaultEmail = this.configService.get<string>('DEFAULT_USER_EMAIL') || 'admin@example.com';
    const defaultPassword = this.configService.get<string>('DEFAULT_USER_PASSWORD') || '123456';
    const defaultName = this.configService.get<string>('DEFAULT_USER_NAME') || 'Admin User';
    
    const existingUser = await this.usersService.findByEmail(defaultEmail);

    if (!existingUser) {
      await this.usersService.create({
        email: defaultEmail,
        password: defaultPassword,
        name: defaultName,
      });
      console.log(`✅ Usuário padrão criado: ${defaultEmail}`);
    }
  }
}
