import { Module } from '@nestjs/common';
import { commonConstants } from 'src/shared/constants';
import { WeatherRepository } from '../weather/infraestructure/adapters/weather.repository';
import { WeatherModule } from '../weather/weather.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsAdapters } from './infraestructure/adapters/analytics.adapters';

@Module({
  imports: [WeatherModule],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    { provide: commonConstants.ports.WEATHER, useClass: WeatherRepository },
    { provide: commonConstants.ports.ANALYTICS, useClass: AnalyticsAdapters },
  ],
})
export class AnalyticsModule {}
