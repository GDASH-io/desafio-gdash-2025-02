import { Injectable } from '@nestjs/common';
import { WeatherLog } from '../../../domain/entities/weather-log.entity';

export interface StatisticalResult {
  avg_temp: number;
  avg_humidity: number;
  min_temp: number;
  max_temp: number;
  std_dev_temp: number;
  std_dev_humidity: number;
}

@Injectable()
export class StatisticalAnalyzer {
  analyze(logs: WeatherLog[]): StatisticalResult {
    if (logs.length === 0) {
      throw new Error('Não há logs para analisar');
    }

    const temps = logs
      .map((log) => log.temperature_c)
      .filter((t) => t != null && !isNaN(t));
    const humidities = logs
      .map((log) => log.relative_humidity)
      .filter((h) => h != null && !isNaN(h));

    if (temps.length === 0 || humidities.length === 0) {
      throw new Error('Dados insuficientes para análise estatística');
    }

    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;

    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);

    // Desvio padrão de temperatura
    const tempVariance =
      temps.reduce((sum, temp) => sum + Math.pow(temp - avgTemp, 2), 0) /
      temps.length;
    const stdDevTemp = Math.sqrt(tempVariance);

    // Desvio padrão de umidade
    const humidityVariance =
      humidities.reduce(
        (sum, humidity) => sum + Math.pow(humidity - avgHumidity, 2),
        0,
      ) / humidities.length;
    const stdDevHumidity = Math.sqrt(humidityVariance);

    return {
      avg_temp: Math.round(avgTemp * 10) / 10,
      avg_humidity: Math.round(avgHumidity * 10) / 10,
      min_temp: Math.round(minTemp * 10) / 10,
      max_temp: Math.round(maxTemp * 10) / 10,
      std_dev_temp: Math.round(stdDevTemp * 10) / 10,
      std_dev_humidity: Math.round(stdDevHumidity * 10) / 10,
    };
  }
}

