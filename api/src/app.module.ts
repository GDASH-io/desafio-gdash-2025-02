import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WeatherModule } from './weather/weather.module';
import { LocationModule } from './location/location.module';
import { HealthModule } from './health/health.module';
import { PokemonModule } from './pokemon/pokemon.module';
import { WeatherConfigModule } from './config/config.module';
import { UserService } from './users/users.service';
import { LoggerService } from './common/logger.service';
import { GlobalExceptionFilter } from './common/exception-filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    WeatherModule,
    LocationModule,
    HealthModule,
    PokemonModule,
    WeatherConfigModule,
  ],
  providers: [
    LoggerService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private userService: UserService) {}

  async onModuleInit() {
    // Create default admin user
    await this.userService.createDefaultUser();
  }
}