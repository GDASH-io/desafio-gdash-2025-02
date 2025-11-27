import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { WeatherLog, WeatherLogSchema } from './schemas/weather-log.schema';
import { LoggerService } from '../common/logger.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WeatherLog.name, schema: WeatherLogSchema }])
  ],
  controllers: [WeatherController],
  providers: [WeatherService, LoggerService],
  exports: [WeatherService],
})
export class WeatherModule {}