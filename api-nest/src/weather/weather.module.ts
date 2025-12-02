import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WeatherSchema } from './schemas/weather.schema';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Weather', schema: WeatherSchema }]),
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService]
})
export class WeatherModule {}
