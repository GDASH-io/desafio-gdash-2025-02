import { Injectable, Inject } from '@nestjs/common';
import { IWeatherLogRepository } from '../../../domain/repositories/weather-log.repository';
import { WeatherLog } from '../../../domain/entities/weather-log.entity';

@Injectable()
export class ExportWeatherLogsUseCase {
  constructor(
    @Inject('IWeatherLogRepository')
    private readonly weatherLogRepository: IWeatherLogRepository,
  ) {}

  async execute(query: { start?: string; end?: string; city?: string }): Promise<WeatherLog[]> {
    return this.weatherLogRepository.findForExport({
      start: query.start ? new Date(query.start) : undefined,
      end: query.end ? new Date(query.end) : undefined,
      city: query.city,
    });
  }
}

