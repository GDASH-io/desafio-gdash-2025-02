import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { InsightsModule } from './insights/insights.module';

import {
  WeatherLog,
  WeatherLogSchema,
} from './weather/schemas/meteo-log.schema';
import { WeatherService } from './weather/meteo.service';
import { WeatherController } from './weather/meteo.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    MongooseModule.forFeature([
      { name: WeatherLog.name, schema: WeatherLogSchema },
    ]),
    AuthModule,
    UsersModule,
    InsightsModule,
  ],

  controllers: [WeatherController],
  providers: [WeatherService],
})
export class AppModule {}
