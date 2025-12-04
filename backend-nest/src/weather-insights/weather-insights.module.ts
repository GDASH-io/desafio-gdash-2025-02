import { Module } from "@nestjs/common";
import { WeatherInsightsController } from "./weather-insights.controller";
import { WeatherLogsModule } from "../weather-logs/weather-logs.module";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [WeatherLogsModule, AiModule],
  controllers: [WeatherInsightsController]
})
export class WeatherInsightsModule {}
