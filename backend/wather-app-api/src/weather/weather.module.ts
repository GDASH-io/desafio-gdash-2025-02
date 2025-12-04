import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { CreateWeatherRepositorie } from './repositories/create-weather.repositorie';
import { CreateWeatherService } from './services/create-weather.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Weather, WeatherSchema } from './Schema/weathers.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Weather.name, schema: WeatherSchema }]),
    ConfigModule.forRoot({
      isGlobal: true
    }),
  ],
  controllers: [WeatherController],
  providers: [CreateWeatherRepositorie, CreateWeatherService],
  exports: [CreateWeatherRepositorie, CreateWeatherService]
})
export class WeatherModule { }
