import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import { Insight, InsightSchema } from './schemas/insight.schema';
import { WeatherModule } from '../weather/weather.module';
import { GeminiService } from './ai/gemini.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Insight.name, schema: InsightSchema },
    ]),
    WeatherModule, // Importar para usar WeatherService
  ],
  controllers: [InsightsController],
  providers: [InsightsService, GeminiService],
  exports: [InsightsService],
})
export class InsightsModule {}