import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Weather, WeatherSchema } from './schema/weather.schema';
import { IaModule } from 'src/ia/ia.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Weather.name, schema: WeatherSchema}]),
    IaModule
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
