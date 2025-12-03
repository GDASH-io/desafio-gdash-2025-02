import { Module } from "@nestjs/common";
import { WeatherController } from "./presentation/weather.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { WeatherLog, WeatherLogSchema } from "./infrastructure/schemas/weather-log.schema";
import { ConfigModule } from "@nestjs/config";
import { WeatherLogRepository } from "./infrastructure/repositories/weather-log.repository";
import { AIInsightsService } from "./infrastructure/services/ai-insights.service";
import { ExportService } from "./infrastructure/services/export.service";
import { CreateWeatherLogUseCase } from "./application/use-cases/create-weather-log.use-case";
import { ExportWeatherDataUseCase } from "./application/use-cases/export-weather-data.use-case";
import { GenerateInsightsUseCase } from "./application/use-cases/generate-insights.use-case";
import { ListWeatherLogsUseCase } from "./application/use-cases/list-weather-logs.use-case";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: WeatherLog.name, schema: WeatherLogSchema }
        ]),
        ConfigModule,
    ],
    controllers: [WeatherController],
    providers: [
        WeatherLogRepository,
        AIInsightsService,
        ExportService,
        CreateWeatherLogUseCase,
        ListWeatherLogsUseCase,
        GenerateInsightsUseCase,
        ExportWeatherDataUseCase,
    ],
    exports: [WeatherLogRepository]
})
export class WeatherModule{}