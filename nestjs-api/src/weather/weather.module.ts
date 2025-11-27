import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Weather, WeatherSchema } from './schemas/weather.schema';
import { WeatherController } from './weather.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Weather.name, schema: WeatherSchema }]),
  ],
  controllers: [WeatherController],
  providers: [],
})
export class WeatherModule {}
