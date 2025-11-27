import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { WeatherModule } from './weather/weather.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { EventsModule } from './events/events.module'
import { RabbitModule } from './rabbit/rabbit.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { RickAndMortyModule } from './publicApi/rick-and-morty.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '../.env', '.env'],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    RabbitModule,
    WeatherModule,
    DashboardModule,
    AnalyticsModule,
    EventsModule,
    RickAndMortyModule,
  ],
})
export class AppModule {}
