import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { ExceptionFilterWithLogging } from './common/filters/exception.filter';
import { AuthGuard } from './common/guards/auth.guard';
import { validate } from './env.validation';
import { AiModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { EncryptModule } from './modules/encrypt/encrypt.module';
import { ExplorerModule } from './modules/explorer/explorer.module';
import { SpreadsheetModule } from './modules/spreadsheet/spreadsheet.module';
import { UsersModule } from './modules/users/users.module';
import { WeatherModule } from './modules/weather/weather.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 20,
        },
      ],
    }),
    WeatherModule,
    DatabaseModule,
    SpreadsheetModule,
    UsersModule,
    EncryptModule,
    AiModule,
    AnalyticsModule,
    ExplorerModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionFilterWithLogging,
    },
  ],
})
export class AppModule {}
