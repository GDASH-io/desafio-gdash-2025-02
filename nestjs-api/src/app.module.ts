import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherModule } from './weather/weather.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PokemonModule } from './common/pokemon.module';
import { HealthModule } from './health/health.module';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    WeatherModule,
    UsersModule,
    AuthModule,
    PokemonModule,
    HealthModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const defaultEmail =
      this.configService.get<string>('DEFAULT_USER_EMAIL') || 'admin@example.com';
    const defaultPassword = this.configService.get<string>('DEFAULT_USER_PASSWORD') || '123456';
    const defaultName = this.configService.get<string>('DEFAULT_USER_NAME') || 'Admin';

    await this.usersService.createDefaultUser(defaultEmail, defaultPassword, defaultName);
  }
}
