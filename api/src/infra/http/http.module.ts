import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WeatherIngestController } from "./controllers/weather-ingest.controller";
import { WeatherQueryController } from "./controllers/weather-query.controller";
import { WeatherExportCSVController } from "./controllers/weather-export-csv.controller";
import { WeatherExportXLSXController } from "./controllers/weather-export-xlsx.controller";
import { DatabaseModule } from "../database/mongodb/database.module";
import {
  WeatherLogMongoSchema,
  WeatherLogSchema,
} from "../database/schemas/weather-log.schema";
import { CreateWeatherLogUseCase } from "src/domain/application/use-cases/create-weather-log.use-case";
import { ListWeatherLogsUseCase } from "src/domain/application/use-cases/list-weather-logs.use-case";
import { ExportWeatherLogsCsvUseCase } from "src/domain/application/use-cases/export-weather-logs-csv.use-case";
import { ExportWeatherLogsXlsxUseCase } from "src/domain/application/use-cases/export-weather-logs-xlsx.use-case";
import { WeatherLogRepository } from "src/domain/application/repositories/weather-log-repository";
import { MongoDBWeatherLogRepository } from "../database/repositories/mongodb-weather-log-repository";

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
  ],
  providers: [
    CreateWeatherLogUseCase,
    ListWeatherLogsUseCase,
    ExportWeatherLogsCsvUseCase,
    ExportWeatherLogsXlsxUseCase,
    {
      provide: WeatherLogRepository,
      useClass: MongoDBWeatherLogRepository,
    },
  ],
})
export class HttpModule {}
