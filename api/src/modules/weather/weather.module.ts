import { Module } from '@nestjs/common';
import { commonConstants } from 'src/shared/constants';
import { AiModule } from '../ai/ai.module';
import { DatabaseModule } from '../database/database.module';
import { SpreadsheetModule } from '../spreadsheet/spreadsheet.module';
import { WeatherRepository } from './infraestructure/adapters/weather.repository';
import { weatherProviders } from './infraestructure/schema/weather.provider';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

@Module({
  imports: [DatabaseModule, AiModule, SpreadsheetModule],
  controllers: [WeatherController],
  providers: [
    WeatherService,
    ...weatherProviders,
    { provide: commonConstants.ports.WEATHER, useClass: WeatherRepository },
  ],
  exports: [WeatherService, ...weatherProviders],
})
export class WeatherModule {}
