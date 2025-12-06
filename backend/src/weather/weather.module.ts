import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherLog, WeatherLogSchema } from './schemas/weather-log.schema';
import { WeatherRepository } from './infrastructure/weather.repository';
import { IWeatherRepository } from './domain/weather.repository.interface';

@Module({
  imports: [MongooseModule.forFeature([{ name: WeatherLog.name, schema: WeatherLogSchema }])],
  controllers: [WeatherController],
  providers: [
    WeatherService,
    {
      provide: IWeatherRepository,
      useClass: WeatherRepository,
    },
  ],
})
export class WeatherModule {}
