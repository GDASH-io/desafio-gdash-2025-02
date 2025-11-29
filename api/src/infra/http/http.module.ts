import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { WeatherIngestController } from "./controllers/weather-ingest.controller";
import { WeatherQueryController } from "./controllers/weather-query.controller";
import { WeatherExportCSVController } from "./controllers/weather-export-csv.controller";
import { WeatherExportXLSXController } from "./controllers/weather-export-xlsx.controller";
import { WeatherInsightsController } from "./controllers/weather-insights.controller";
import { WeatherAnalyticsController } from "./controllers/weather-analytics.controller";
import { WeatherDashboardController } from "./controllers/weather-dashboard.controller";
import { DatabaseModule } from "../database/mongodb/database.module";
import {
  WeatherLogMongoSchema,
  WeatherLogSchema,
} from "../database/schemas/weather-log.schema";
import { CreateWeatherLogUseCase } from "src/domain/application/use-cases/create-weather-log.use-case";
import { ListWeatherLogsUseCase } from "src/domain/application/use-cases/list-weather-logs.use-case";
import { ExportWeatherLogsCsvUseCase } from "src/domain/application/use-cases/export-weather-logs-csv.use-case";
import { ExportWeatherLogsXlsxUseCase } from "src/domain/application/use-cases/export-weather-logs-xlsx.use-case";
import { GenerateWeatherInsightsUseCase } from "src/domain/application/use-cases/generate-weather-insights.use-case";
import { CalculateWeatherStatisticsUseCase } from "src/domain/application/use-cases/calculate-weather-statistics.use-case";
import { DetectWeatherTrendsUseCase } from "src/domain/application/use-cases/detect-weather-trends.use-case";
import { GenerateWeatherAlertsUseCase } from "src/domain/application/use-cases/generate-weather-alerts.use-case";
import { GenerateWeatherSummaryUseCase } from "src/domain/application/use-cases/generate-weather-summary.use-case";
import { WeatherLogRepository } from "src/domain/application/repositories/weather-log-repository";
import { MongoDBWeatherLogRepository } from "../database/repositories/mongodb-weather-log-repository";
import { CalculateComfortIndexUseCase } from "@/domain/application/use-cases/calculate-comfort-index.use-case";
import { ClassifyWeatherDayUseCase } from "@/domain/application/use-cases/classify-weather-day.use-case";

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: WeatherLogSchema.name, schema: WeatherLogMongoSchema },
    ]),
  ],
  controllers: [
    WeatherIngestController,
    WeatherQueryController,
    WeatherExportCSVController,
    WeatherExportXLSXController,
    WeatherInsightsController,
    WeatherAnalyticsController,
    WeatherDashboardController,
  ],
  providers: [
    CreateWeatherLogUseCase,
    ListWeatherLogsUseCase,
    ExportWeatherLogsCsvUseCase,
    ExportWeatherLogsXlsxUseCase,
    ClassifyWeatherDayUseCase,
    GenerateWeatherInsightsUseCase,
    CalculateWeatherStatisticsUseCase,
    DetectWeatherTrendsUseCase,
    GenerateWeatherAlertsUseCase,
    CalculateComfortIndexUseCase,
    GenerateWeatherSummaryUseCase,

    {
      provide: WeatherLogRepository,
      useClass: MongoDBWeatherLogRepository,
    },
  ],
})
export class HttpModule {}
