import { Injectable } from '@nestjs/common';
import { WeatherLog } from '../../../domain/entities/weather-log.entity';

export interface SoilingRiskResult {
  level: 'high' | 'medium' | 'low';
  score: number; // 0-100
  message: string;
  accumulated_precipitation_mm: number;
}

@Injectable()
export class SoilingRiskRule {
  private readonly HIGH_RISK_THRESHOLD = 50; // mm em 7 dias
  private readonly MEDIUM_RISK_THRESHOLD = 25; // mm em 7 dias

  calculate(logs: WeatherLog[]): SoilingRiskResult {
    if (logs.length === 0) {
      return {
        level: 'low',
        score: 0,
        message: 'Sem dados suficientes para calcular risco de sujeira.',
        accumulated_precipitation_mm: 0,
      };
    }

    // Calcular precipitação acumulada dos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLogs = logs.filter(
      (log) => new Date(log.timestamp) >= sevenDaysAgo,
    );

    const accumulatedPrecipitation = recentLogs.reduce(
      (sum, log) => sum + (log.precipitation_mm || 0),
      0,
    );

    let level: 'high' | 'medium' | 'low';
    let score: number;
    let message: string;

    if (accumulatedPrecipitation >= this.HIGH_RISK_THRESHOLD) {
      level = 'high';
      score = Math.min(100, Math.round((accumulatedPrecipitation / this.HIGH_RISK_THRESHOLD) * 100));
      message = `Precipitação acumulada de ${accumulatedPrecipitation.toFixed(1)}mm nos últimos 7 dias indica alto risco de sujeira nos painéis solares. Recomenda-se limpeza dos painéis para manter eficiência.`;
    } else if (accumulatedPrecipitation >= this.MEDIUM_RISK_THRESHOLD) {
      level = 'medium';
      score = Math.round((accumulatedPrecipitation / this.MEDIUM_RISK_THRESHOLD) * 50);
      message = `Precipitação acumulada de ${accumulatedPrecipitation.toFixed(1)}mm nos últimos 7 dias indica risco médio de sujeira. Monitore as condições dos painéis e considere limpeza preventiva.`;
    } else {
      level = 'low';
      score = Math.round((accumulatedPrecipitation / this.MEDIUM_RISK_THRESHOLD) * 25);
      message = `Precipitação acumulada de ${accumulatedPrecipitation.toFixed(1)}mm nos últimos 7 dias. Risco baixo de sujeira nos painéis.`;
    }

    return {
      level,
      score,
      message,
      accumulated_precipitation_mm: Math.round(accumulatedPrecipitation * 10) / 10,
    };
  }
}

