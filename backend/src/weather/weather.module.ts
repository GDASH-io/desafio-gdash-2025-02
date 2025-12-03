import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherStatisticsService } from './services/weather-statistics.service';
import { WeatherInsightsGeneratorService } from './services/weather-insights-generator.service';
import { WeatherExportService } from './services/weather-export.service';
import { WeatherLog, WeatherLogSchema } from './schemas/weather-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WeatherLog.name, schema: WeatherLogSchema }]),
  ],
  controllers: [WeatherController],
  providers: [
    WeatherService,
    WeatherStatisticsService,
    WeatherInsightsGeneratorService,
    WeatherExportService,
  ],
  exports: [WeatherService],
})
export class WeatherModule {}

