import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherController } from '../weather/weather.controller';
import { WeatherService } from '../weather/weather.service';

import {
  WeatherLog,
  WeatherLogSchema,
} from '../weather/schemas/weather-log.schema';

import { WeatherPaginationService } from '../weather/weather-pagination.service';
import { WeatherPaginationController } from '../weather/weather-pagination.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: WeatherLog.name,
        schema: WeatherLogSchema,
      },
    ]),
  ],
  providers: [WeatherService, WeatherPaginationService],
  controllers: [WeatherController, WeatherPaginationController],
})
export class WeatherModule {}
