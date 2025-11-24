import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule } from '@nestjs/config'

import { WeatherModule } from './weather/weather.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { EventsModule } from './events/events.module'
import { RabbitModule } from './rabbit/rabbit.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://mongo:27017/climate'
    ),
    AuthModule,
    UsersModule,
    RabbitModule,
    WeatherModule,
    DashboardModule,
    AnalyticsModule,
    EventsModule,
  ],
})
export class AppModule {}
