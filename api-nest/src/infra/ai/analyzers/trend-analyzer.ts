import { Injectable } from '@nestjs/common';
import { WeatherLog } from '../../../domain/entities/weather-log.entity';

export interface TrendResult {
  trend: 'rising' | 'falling' | 'stable';
  slope: number;
  confidence: number; // 0-100
}

@Injectable()
export class TrendAnalyzer {
  analyze(logs: WeatherLog[], field: 'temperature_c' | 'relative_humidity'): TrendResult {
    if (logs.length < 2) {
      return {
        trend: 'stable',
        slope: 0,
        confidence: 0,
      };
    }

    // Ordenar logs por timestamp
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    // Extrair valores e índices
    const values = sortedLogs.map((log) => log[field] as number).filter((v) => v != null && !isNaN(v));
    const n = values.length;

    if (n < 2) {
      return {
        trend: 'stable',
        slope: 0,
        confidence: 0,
      };
    }

    // Regressão linear simples: y = a + b*x
    // onde x é o índice (tempo) e y é o valor
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Calcular coeficiente de correlação (R²) para confidence
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, yi, i) => {
      const predicted = slope * x[i] + (yMean - slope * (sumX / n));
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;
    const confidence = Math.max(0, Math.min(100, Math.round(rSquared * 100)));

    // Threshold para determinar se é estável
    const threshold = 0.1; // Se slope < 0.1, considerar estável
    let trend: 'rising' | 'falling' | 'stable';

    if (Math.abs(slope) < threshold) {
      trend = 'stable';
    } else if (slope > 0) {
      trend = 'rising';
    } else {
      trend = 'falling';
    }

    return {
      trend,
      slope: Math.round(slope * 1000) / 1000, // 3 casas decimais
      confidence,
    };
  }
}

