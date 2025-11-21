import { Injectable, Inject } from '@nestjs/common';
import { IWeatherLogRepository } from '../../../domain/repositories/weather-log.repository';
import { WeatherLog } from '../../../domain/entities/weather-log.entity';
import { CreateWeatherLogDto } from '../../../presentation/dto/create-weather-log.dto';

@Injectable()
export class CreateWeatherLogsUseCase {
  constructor(
    @Inject('IWeatherLogRepository')
    private readonly weatherLogRepository: IWeatherLogRepository,
  ) {}

  async execute(logs: CreateWeatherLogDto[]): Promise<{ created: number; ids: string[] }> {
    const weatherLogs: Partial<WeatherLog>[] = logs.map((log) => ({
      timestamp: new Date(log.timestamp),
      city: log.city,
      source: log.source,
      temperature_c: log.temperature_c,
      relative_humidity: log.relative_humidity,
      precipitation_mm: log.precipitation_mm || 0,
      wind_speed_m_s: log.wind_speed_m_s,
      clouds_percent: log.clouds_percent,
      weather_code: log.weather_code,
      estimated_irradiance_w_m2: log.estimated_irradiance_w_m2,
      temp_effect_factor: log.temp_effect_factor,
      soiling_risk: log.soiling_risk,
      wind_derating_flag: log.wind_derating_flag || false,
      pv_derating_pct: log.pv_derating_pct,
    }));

    const created = await this.weatherLogRepository.createMany(weatherLogs);
    const ids = created.map((log) => (log as any)._id.toString());

    return {
      created: created.length,
      ids,
    };
  }
}

