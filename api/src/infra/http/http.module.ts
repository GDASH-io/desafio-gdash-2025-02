import { Module } from "@nestjs/common";
import { WeatherController } from "./controllers/weather.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { CreateWeatherLogUseCase } from "src/domain/application/use-cases/create-weather-log.use-case";
import { ListWeatherLogsUseCase } from "src/domain/application/use-cases/list-weather-logs.use-case";
import { WeatherLogRepository } from "src/domain/application/repositories/weather-log-repository";

@Module({
  imports: [
    // DatabaseModule,
    // MongooseModule.forFeature([
    //   { name: WeatherLogSchema.name, schema: WeatherLogMongoSchema },
    // ]),
  ],
  controllers: [WeatherController],
  providers: [
    CreateWeatherLogUseCase,
    ListWeatherLogsUseCase,
    // {
    //   provide: WeatherLogRepository,
    //   useClass: MongoDBWeatherLogRepository,
    // },
  ],
})
export class HttpModule {}
