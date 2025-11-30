import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { Weather, WeatherSchema } from './entities/weather.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherMongoRepository } from './repositories/weather.mongo.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Weather.name, schema: WeatherSchema }]),
  ],
  controllers: [WeatherController],
  providers: [
    WeatherService,
    {
      provide: 'IWeatherRepository',
      useClass: WeatherMongoRepository,
    },
  ],
})
export class WeatherModule {}
