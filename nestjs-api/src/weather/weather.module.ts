import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { WeatherLog, WeatherLogSchema } from './schemas/weather-log.schema';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WeatherLog.name, schema: WeatherLogSchema }]),
    HttpModule,
  ],
  providers: [WeatherService],
  controllers: [WeatherController],
})
export class WeatherModule {}
