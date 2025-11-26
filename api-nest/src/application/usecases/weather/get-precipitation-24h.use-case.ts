import { Injectable, Inject } from '@nestjs/common';
import { IWeatherLogRepository } from '../../../domain/repositories/weather-log.repository';

@Injectable()
export class GetPrecipitation24hUseCase {
  constructor(
    @Inject('IWeatherLogRepository')
    private readonly weatherLogRepository: IWeatherLogRepository,
  ) {}

  async execute(city?: string): Promise<{ accumulated_mm: number; count: number }> {
    // Calcular 24 horas atrás
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Buscar logs das últimas 24 horas
    const logs = await this.weatherLogRepository.findForExport({
      start: twentyFourHoursAgo,
      end: now,
      city,
    });

    // Calcular precipitação acumulada
    const accumulated = logs.reduce(
      (sum, log) => sum + (log.precipitation_mm || 0),
      0,
    );

    return {
      accumulated_mm: Math.round(accumulated * 10) / 10,
      count: logs.length,
    };
  }
}

