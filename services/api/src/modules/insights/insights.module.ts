import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GenerateInsightService } from './features/generate-insight/generate-insight.service';
import { GenerateInsightController } from './features/generate-insight/generate-insight.controller';
import { GroqService } from './features/generate-insight/groq.service';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    WeatherModule,
  ],
  controllers: [GenerateInsightController],
  providers: [GenerateInsightService, GroqService],
  exports: [GenerateInsightService],
})
export class InsightsModule {}
