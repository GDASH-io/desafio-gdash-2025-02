import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WeatherModule } from './modules/weather/weather.module';
import { InsightsModule } from './modules/insights/insights.module';
import { CreateUserService } from './modules/users/features/create-user/create-user.service';
import { FindUsersService } from './modules/users/features/find-users/find-users.service';

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
    WeatherModule,
    InsightsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly findUsersService: FindUsersService,
    private readonly createUserService: CreateUserService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const defaultEmail = this.configService.get<string>('DEFAULT_USER_EMAIL') || 'admin@example.com';
    const defaultPassword = this.configService.get<string>('DEFAULT_USER_PASSWORD') || '123456';
    const defaultName = this.configService.get<string>('DEFAULT_USER_NAME') || 'Admin User';
    
    const existingUser = await this.findUsersService.findByEmail(defaultEmail);

    if (!existingUser) {
      await this.createUserService.create({
        email: defaultEmail,
        password: defaultPassword,
        name: defaultName,
      });
      console.log(`✅ Usuário padrão criado: ${defaultEmail}`);
    }
  }
}
