import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherLog, WeatherLogSchema } from '../../domain/entities/weather-log.entity';
import { WeatherLogRepositoryImpl } from '../../infra/database/repositories/weather-log.repository.impl';
import { CreateWeatherLogsUseCase } from '../../application/usecases/weather/create-weather-logs.use-case';
import { GetWeatherLogsUseCase } from '../../application/usecases/weather/get-weather-logs.use-case';
import { GetLatestWeatherLogUseCase } from '../../application/usecases/weather/get-latest-weather-log.use-case';
import { ExportWeatherLogsUseCase } from '../../application/usecases/weather/export-weather-logs.use-case';
import { GetPrecipitation24hUseCase } from '../../application/usecases/weather/get-precipitation-24h.use-case';
import { WeatherLogsController } from '../../presentation/controllers/weather-logs.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WeatherLog.name, schema: WeatherLogSchema }]),
  ],
  controllers: [WeatherLogsController],
  providers: [
    {
      provide: 'IWeatherLogRepository',
      useClass: WeatherLogRepositoryImpl,
    },
    CreateWeatherLogsUseCase,
    GetWeatherLogsUseCase,
    GetLatestWeatherLogUseCase,
    ExportWeatherLogsUseCase,
    GetPrecipitation24hUseCase,
  ],
  exports: ['IWeatherLogRepository'],
})
export class WeatherModule {}
