import { Injectable } from '@nestjs/common';

export interface Alert {
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
}

@Injectable()
export class TextGenerator {
  generateSummary(data: {
    period: { from: Date; to: Date };
    statistics: {
      avg_temp: number;
      avg_humidity: number;
      trend: 'rising' | 'falling' | 'stable';
      classification: string;
    };
    pv_metrics: {
      estimated_production_pct: number;
      soiling_risk?: { level: string; message: string };
      consecutive_cloudy_days?: { consecutive_days: number; estimated_reduction_pct: number };
      heat_derating?: { derating_pct: number; message: string };
    };
  }): string {
    const daysDiff = Math.ceil(
      (data.period.to.getTime() - data.period.from.getTime()) / (1000 * 60 * 60 * 24),
    );
    const periodText = daysDiff === 1 ? 'último dia' : `últimos ${daysDiff} dias`;

    const parts: string[] = [];

    // Temperatura e umidade
    parts.push(
      `No ${periodText}, a temperatura média foi de ${data.statistics.avg_temp.toFixed(1)}°C`,
    );
    parts.push(`com umidade média de ${data.statistics.avg_humidity.toFixed(0)}%`);

    // Tendência
    if (data.statistics.trend === 'rising') {
      parts.push('e tendência de aumento gradual');
    } else if (data.statistics.trend === 'falling') {
      parts.push('e tendência de diminuição');
    }

    // Classificação
    parts.push(`(${data.statistics.classification})`);

    // Produção estimada
    parts.push(
      `A produção estimada de energia solar está em ${data.pv_metrics.estimated_production_pct.toFixed(1)}% da capacidade máxima.`,
    );

    // Fatores de redução
    const reductionFactors: string[] = [];

    if (data.pv_metrics.soiling_risk?.level === 'high') {
      reductionFactors.push('risco alto de sujeira');
    }

    if (data.pv_metrics.consecutive_cloudy_days && data.pv_metrics.consecutive_cloudy_days.consecutive_days > 0) {
      reductionFactors.push(
        `${data.pv_metrics.consecutive_cloudy_days.consecutive_days} dia(s) consecutivo(s) nublado(s)`,
      );
    }

    if (data.pv_metrics.heat_derating && data.pv_metrics.heat_derating.derating_pct > 2) {
      reductionFactors.push('derating por calor');
    }

    if (reductionFactors.length > 0) {
      parts.push(
        `Fatores que reduzem a produção: ${reductionFactors.join(', ')}.`,
      );
    }

    return parts.join('. ') + '.';
  }

  generateAlerts(data: {
    logs: Array<{
      temperature_c: number;
      precipitation_mm: number;
      wind_speed_m_s: number;
      clouds_percent: number;
      timestamp: Date | string;
    }>;
  }): Alert[] {
    const alerts: Alert[] = [];

    // Verificar próximas horas (últimas 6 horas de dados)
    const recentLogs = data.logs
      .slice(-6)
      .map((log) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }))
      .filter((log) => {
        const hoursAgo = (Date.now() - log.timestamp.getTime()) / (1000 * 60 * 60);
        return hoursAgo <= 6;
      });

    if (recentLogs.length === 0) {
      return alerts;
    }

    // Alerta de chuva
    const totalPrecipitation = recentLogs.reduce(
      (sum, log) => sum + (log.precipitation_mm || 0),
      0,
    );
    if (totalPrecipitation > 10) {
      alerts.push({
        type: 'precipitation',
        severity: totalPrecipitation > 20 ? 'high' : 'medium',
        message: `Chuva prevista nas próximas horas: ${totalPrecipitation.toFixed(1)}mm acumulados.`,
      });
    }

    // Alerta de calor extremo
    const highTempCount = recentLogs.filter((log) => log.temperature_c > 35).length;
    if (highTempCount >= 3) {
      const maxTemp = Math.max(...recentLogs.map((log) => log.temperature_c));
      alerts.push({
        type: 'heat',
        severity: 'high',
        message: `Calor extremo: temperatura acima de 35°C por ${highTempCount} horas consecutivas (pico: ${maxTemp.toFixed(1)}°C).`,
      });
    }

    // Alerta de frio intenso
    const lowTempCount = recentLogs.filter((log) => log.temperature_c < 10).length;
    if (lowTempCount >= 3) {
      const minTemp = Math.min(...recentLogs.map((log) => log.temperature_c));
      alerts.push({
        type: 'cold',
        severity: 'high',
        message: `Frio intenso: temperatura abaixo de 10°C por ${lowTempCount} horas consecutivas (mínima: ${minTemp.toFixed(1)}°C).`,
      });
    }

    // Alerta de vento forte
    const maxWind = Math.max(...recentLogs.map((log) => log.wind_speed_m_s || 0));
    if (maxWind > 15) {
      alerts.push({
        type: 'wind',
        severity: maxWind > 20 ? 'high' : 'medium',
        message: `Vento forte detectado: velocidade de até ${maxWind.toFixed(1)} m/s.`,
      });
    }

    return alerts;
  }
}

