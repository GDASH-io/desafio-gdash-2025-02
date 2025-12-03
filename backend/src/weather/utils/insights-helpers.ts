import { WeatherLog } from '../schemas/weather-log.schema';

/**
 * Calcula estatísticas básicas de temperatura e umidade
 */
export interface WeatherStatistics {
  averageTemperature: number;
  averageHumidity: number;
  maxTemperature: number;
  minTemperature: number;
  maxHumidity: number;
  minHumidity: number;
}

/**
 * Calcula estatísticas de temperatura e umidade a partir de logs
 *
 * @param logs - Array de logs climáticos
 * @returns Estatísticas calculadas
 */
export function calculateStatistics(logs: WeatherLog[]): WeatherStatistics {
  if (logs.length === 0) {
    return {
      averageTemperature: 0,
      averageHumidity: 0,
      maxTemperature: 0,
      minTemperature: 0,
      maxHumidity: 0,
      minHumidity: 0,
    };
  }

  const temperatures = logs.map((log) => log.temperature);
  const humidities = logs.map((log) => log.humidity);

  const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
  const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;
  const maxTemp = Math.max(...temperatures);
  const minTemp = Math.min(...temperatures);
  const maxHumidity = Math.max(...humidities);
  const minHumidity = Math.min(...humidities);

  return {
    averageTemperature: parseFloat(avgTemp.toFixed(1)),
    averageHumidity: parseFloat(avgHumidity.toFixed(1)),
    maxTemperature: maxTemp,
    minTemperature: minTemp,
    maxHumidity: maxHumidity,
    minHumidity: minHumidity,
  };
}

/**
 * Detecta a tendência de temperatura comparando os últimos registros
 *
 * @param temperatures - Array de temperaturas ordenadas (mais recentes primeiro)
 * @returns 'subindo', 'caindo' ou 'estável'
 */
export function detectTemperatureTrend(temperatures: number[]): string {
  if (temperatures.length < 20) {
    return 'estável';
  }

  const last10 = temperatures.slice(0, 10);
  const previous10 = temperatures.slice(10, 20);

  const avgLast10 = last10.reduce((a, b) => a + b, 0) / last10.length;
  const avgPrevious10 =
    previous10.length > 0
      ? previous10.reduce((a, b) => a + b, 0) / previous10.length
      : avgLast10;

  if (avgLast10 > avgPrevious10) {
    return 'subindo';
  } else if (avgLast10 < avgPrevious10) {
    return 'caindo';
  }
  return 'estável';
}

/**
 * Calcula pontuação de conforto climático (0-100)
 * Baseado em temperatura ideal (20-26°C) e umidade ideal (40-70%)
 *
 * @param avgTemp - Temperatura média
 * @param avgHumidity - Umidade média
 * @returns Pontuação de 0 a 100
 */
export function calculateComfortScore(avgTemp: number, avgHumidity: number): number {
  let score = 100;

  // Penalizar temperatura fora da faixa ideal
  if (avgTemp < 20) {
    score -= (20 - avgTemp) * 2;
  } else if (avgTemp > 26) {
    score -= (avgTemp - 26) * 2;
  }

  // Penalizar umidade fora da faixa ideal
  if (avgHumidity < 40) {
    score -= (40 - avgHumidity) * 0.5;
  } else if (avgHumidity > 70) {
    score -= (avgHumidity - 70) * 0.5;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Classifica o dia baseado em temperatura e umidade
 *
 * @param avgTemp - Temperatura média
 * @param avgHumidity - Umidade média
 * @returns Classificação: 'frio', 'quente', 'úmido' ou 'agradável'
 */
export function classifyDay(avgTemp: number, avgHumidity: number): string {
  if (avgTemp < 15) {
    return 'frio';
  }
  if (avgTemp > 30) {
    return 'quente';
  }
  if (avgHumidity > 80) {
    return 'úmido';
  }
  if (avgTemp >= 20 && avgTemp <= 26 && avgHumidity >= 40 && avgHumidity <= 70) {
    return 'agradável';
  }
  return 'agradável';
}

/**
 * Gera alertas baseados em condições extremas
 *
 * @param statistics - Estatísticas climáticas
 * @param tempTrend - Tendência de temperatura
 * @returns Array de mensagens de alerta
 */
export function generateAlerts(
  statistics: WeatherStatistics,
  tempTrend: string
): string[] {
  const alerts: string[] = [];

  if (statistics.maxTemperature > 35) {
    alerts.push('Calor extremo detectado');
  }
  if (statistics.minTemperature < 10) {
    alerts.push('Frio intenso detectado');
  }
  if (statistics.averageHumidity > 85) {
    alerts.push('Alta umidade - chance de chuva');
  }
  if (tempTrend === 'subindo' && statistics.averageTemperature > 25) {
    alerts.push('Temperatura em tendência de alta');
  }

  return alerts.length > 0 ? alerts : ['Nenhum alerta no momento'];
}

