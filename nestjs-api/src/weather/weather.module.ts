import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherDataSchema } from './schemas/weather-data.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'WeatherData', schema: WeatherDataSchema }])],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}