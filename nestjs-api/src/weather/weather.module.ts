import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { WeatherLog, WeatherLogSchema } from './schemas/weather-log.schema';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { AiModule } from '../ai/ai.module';
import { CityCoordinatesService } from './city-coordinates.service';
import { TmdbModule } from '../tmdb/tmdb.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WeatherLog.name, schema: WeatherLogSchema }]),
    HttpModule,
    AiModule,
    TmdbModule,
  ],
  providers: [WeatherService, CityCoordinatesService],
  controllers: [WeatherController],
  exports: [CityCoordinatesService],
})
export class WeatherModule {}
