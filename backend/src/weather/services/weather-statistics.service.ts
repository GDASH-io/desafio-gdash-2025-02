import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from '../schemas/weather-log.schema';
import {
  calculateStatistics,
  detectTemperatureTrend,
  WeatherStatistics,
} from '../utils/insights-helpers';

/**
 * Serviço para cálculos estatísticos de dados climáticos
 */
@Injectable()
export class WeatherStatisticsService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLogDocument>
  ) {}

  /**
   * Calcula estatísticas dos últimos N registros
   *
   * @param limit - Número de registros a considerar (padrão: 30)
   * @param city - Cidade para filtrar os registros (opcional)
   * @returns Estatísticas calculadas
   */
  async getRecentStatistics(limit: number = 30, city?: string): Promise<WeatherStatistics> {
    const filter: any = {};
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    const recentLogs = await this.weatherLogModel
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();

    return calculateStatistics(recentLogs);
  }

  /**
   * Detecta a tendência de temperatura
   *
   * @param limit - Número de registros a considerar (padrão: 30)
   * @param city - Cidade para filtrar os registros (opcional)
   * @returns Tendência: 'subindo', 'caindo' ou 'estável'
   */
  async getTemperatureTrend(limit: number = 30, city?: string): Promise<string> {
    const filter: any = {};
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    const recentLogs = await this.weatherLogModel
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();

    const temperatures = recentLogs.map((log) => log.temperature);
    return detectTemperatureTrend(temperatures);
  }
}

