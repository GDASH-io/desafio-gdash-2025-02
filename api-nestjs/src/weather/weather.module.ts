import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherController } from './weather.controller';
import { WeatherLog, WeatherLogSchema } from './weather.schema';
import { WeatherService } from './weather.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: WeatherLog.name, schema: WeatherLogSchema }]),
  AiModule,
],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService]
})
export class WeatherModule {}