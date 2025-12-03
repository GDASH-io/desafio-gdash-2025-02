import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from '../schemas/weather-log.schema';
import {
  calculateComfortScore,
  classifyDay,
  generateAlerts,
  WeatherStatistics,
} from '../utils/insights-helpers';
import { WeatherStatisticsService } from './weather-statistics.service';

/**
 * Interface para o resultado de insights
 */
export interface WeatherInsightsResult {
  summary: string;
  statistics: WeatherStatistics & { temperatureTrend: string };
  comfortScore: number;
  dayClassification: string;
  alerts: string[];
  dataPoints: number;
}

/**
 * Serviço para geração de insights e análises de dados climáticos
 */
@Injectable()
export class WeatherInsightsGeneratorService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLogDocument>,
    private statisticsService: WeatherStatisticsService
  ) {}

  /**
   * Gera insights completos baseados nos últimos registros
   *
   * @param limit - Número de registros a considerar (padrão: 30)
   * @param city - Cidade para filtrar os registros (opcional)
   * @returns Insights gerados
   */
  async generateInsights(limit: number = 30, city?: string): Promise<WeatherInsightsResult> {
    const filter: any = {};
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    const recentLogs = await this.weatherLogModel
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();

    if (recentLogs.length === 0) {
      throw new Error('Dados insuficientes para gerar insights');
    }

    const statistics = await this.statisticsService.getRecentStatistics(limit, city);
    const tempTrend = await this.statisticsService.getTemperatureTrend(limit, city);
    const comfortScore = calculateComfortScore(
      statistics.averageTemperature,
      statistics.averageHumidity
    );
    const dayClassification = classifyDay(
      statistics.averageTemperature,
      statistics.averageHumidity
    );
    const alerts = generateAlerts(statistics, tempTrend);

    const summary = this.generateSummary(
      recentLogs.length,
      statistics,
      tempTrend,
      dayClassification,
      comfortScore
    );

    return {
      summary,
      statistics: {
        ...statistics,
        temperatureTrend: tempTrend,
      },
      comfortScore: parseFloat(comfortScore.toFixed(0)),
      dayClassification,
      alerts,
      dataPoints: recentLogs.length,
    };
  }

  /**
   * Gera um resumo textual dos insights
   */
  private generateSummary(
    dataPoints: number,
    statistics: WeatherStatistics,
    tempTrend: string,
    dayClassification: string,
    comfortScore: number
  ): string {
    return (
      `Nos últimos ${dataPoints} registros, a temperatura média foi de ` +
      `${statistics.averageTemperature.toFixed(1)}°C (variação: ${statistics.minTemperature.toFixed(1)}°C a ${statistics.maxTemperature.toFixed(1)}°C), ` +
      `com umidade média de ${statistics.averageHumidity.toFixed(1)}% (variação: ${statistics.minHumidity.toFixed(1)}% a ${statistics.maxHumidity.toFixed(1)}%). ` +
      `A temperatura está ${tempTrend}. O clima está classificado como ${dayClassification} ` +
      `com pontuação de conforto de ${comfortScore.toFixed(0)}/100.`
    );
  }
}

