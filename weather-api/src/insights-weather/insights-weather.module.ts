import { Module } from '@nestjs/common';
import { InsightsWeatherController } from './insights-weather.controller';
import { InsightsWeatherService } from './insights-weather.service';

@Module({
  controllers: [InsightsWeatherController],
  providers: [InsightsWeatherService],
})
export class InsightsWeatherModule {}
