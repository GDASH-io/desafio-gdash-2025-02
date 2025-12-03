import { Module } from '@nestjs/common';
import { InsightsWeatherController } from 'insights-weather/insights-weather.controller';
import { InsightsWeatherService } from 'insights-weather/insights-weather.service';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

@Module({
  controllers: [WeatherController, InsightsWeatherController],
  providers: [WeatherService, InsightsWeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}
