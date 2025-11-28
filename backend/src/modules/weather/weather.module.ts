import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherLog, WeatherLogSchema } from './schemas/weather-log.schema';
import { AiInsightModule } from '../ai-insight/ai-insight.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: WeatherLog.name, schema: WeatherLogSchema }]),
    AiInsightModule,
],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}