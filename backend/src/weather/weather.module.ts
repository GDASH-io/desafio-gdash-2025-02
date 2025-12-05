import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { 
  WeatherLog, 
  WeatherLogSchema,
  WeatherInsightCache,
  WeatherInsightCacheSchema 
} from './weather.schema';
import { AIService } from '../ai/ai.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeatherLog.name, schema: WeatherLogSchema },
      { name: WeatherInsightCache.name, schema: WeatherInsightCacheSchema },
    ]),
    HttpModule,
  ],
  controllers: [WeatherController],
  providers: [WeatherService, AIService],
})
export class WeatherModule {}
