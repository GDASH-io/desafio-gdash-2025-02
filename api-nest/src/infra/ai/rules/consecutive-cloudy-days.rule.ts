import { Injectable } from '@nestjs/common';
import { WeatherLog } from '../../../domain/entities/weather-log.entity';

export interface ConsecutiveCloudyDaysResult {
  consecutive_days: number;
  estimated_reduction_pct: number;
  message: string;
}

@Injectable()
export class ConsecutiveCloudyDaysRule {
  private readonly CLOUDY_THRESHOLD = 70; // % de cobertura de nuvens
  private readonly REDUCTION_PER_DAY = 15; // % de redução por dia nublado

  calculate(logs: WeatherLog[]): ConsecutiveCloudyDaysResult {
    if (logs.length === 0) {
      return {
        consecutive_days: 0,
        estimated_reduction_pct: 0,
        message: 'Sem dados suficientes para calcular dias consecutivos nublados.',
      };
    }

    // Agrupar logs por dia
    const logsByDay = new Map<string, WeatherLog[]>();
    logs.forEach((log) => {
      const dateKey = new Date(log.timestamp).toISOString().split('T')[0];
      if (!logsByDay.has(dateKey)) {
        logsByDay.set(dateKey, []);
      }
      logsByDay.get(dateKey)!.push(log);
    });

    // Calcular média de nuvens por dia
    const dailyClouds = Array.from(logsByDay.entries())
      .map(([date, dayLogs]) => {
        const avgClouds =
          dayLogs.reduce((sum, log) => sum + (log.clouds_percent || 0), 0) /
          dayLogs.length;
        return { date, avgClouds };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // Encontrar sequência máxima de dias nublados
    let maxConsecutive = 0;
    let currentConsecutive = 0;

    dailyClouds.forEach((day) => {
      if (day.avgClouds >= this.CLOUDY_THRESHOLD) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 0;
      }
    });

    const estimatedReduction = Math.min(
      100,
      maxConsecutive * this.REDUCTION_PER_DAY,
    );

    let message: string;
    if (maxConsecutive === 0) {
      message = 'Nenhum dia consecutivo nublado detectado no período.';
    } else if (maxConsecutive >= 3) {
      message = `${maxConsecutive} dias consecutivos com alta cobertura de nuvens (≥${this.CLOUDY_THRESHOLD}%). Redução estimada de produção: ${estimatedReduction.toFixed(1)}%.`;
    } else {
      message = `${maxConsecutive} dia(s) consecutivo(s) com alta cobertura de nuvens. Redução estimada de produção: ${estimatedReduction.toFixed(1)}%.`;
    }

    return {
      consecutive_days: maxConsecutive,
      estimated_reduction_pct: Math.round(estimatedReduction * 10) / 10,
      message,
    };
  }
}

