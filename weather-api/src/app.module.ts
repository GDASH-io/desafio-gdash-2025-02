import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'auth/auth.guard';
import { GatewayModule } from 'gateway/gateway.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './database/prisma.module';
import { InsightsWeatherModule } from './insights-weather/insights-weather.module';
import { UserModule } from './user/user.module';
import { WeatherModule } from './weather/weather.module';
@Module({
  imports: [
    CacheModule.register({
      ttl: 24 * 60 * 60,
      isGlobal: true,
    }),
    PrismaModule,
    WeatherModule,
    GatewayModule,
    AuthModule,
    UserModule,
    InsightsWeatherModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
