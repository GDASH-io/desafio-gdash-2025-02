import { Injectable } from '@nestjs/common';
import { WeatherLog } from '../../../domain/entities/weather-log.entity';

export interface WindDeratingResult {
  wind_speed_m_s: number;
  risk_level: 'high' | 'medium' | 'low';
  message: string;
  max_wind_speed: number;
}

@Injectable()
export class WindDeratingRule {
  private readonly HIGH_RISK_THRESHOLD = 20; // m/s para risco alto
  private readonly MEDIUM_RISK_THRESHOLD = 15; // m/s para risco médio

  calculate(logs: WeatherLog[]): WindDeratingResult {
    if (logs.length === 0) {
      return {
        wind_speed_m_s: 0,
        risk_level: 'low',
        message: 'Sem dados suficientes para calcular risco de vento.',
        max_wind_speed: 0,
      };
    }

    const windSpeeds = logs
      .map((log) => log.wind_speed_m_s)
      .filter((w) => w != null && !isNaN(w));

    if (windSpeeds.length === 0) {
      return {
        wind_speed_m_s: 0,
        risk_level: 'low',
        message: 'Sem dados de velocidade do vento disponíveis.',
        max_wind_speed: 0,
      };
    }

    const avgWindSpeed =
      windSpeeds.reduce((sum, speed) => sum + speed, 0) / windSpeeds.length;
    const maxWindSpeed = Math.max(...windSpeeds);

    let riskLevel: 'high' | 'medium' | 'low';
    let message: string;

    if (maxWindSpeed >= this.HIGH_RISK_THRESHOLD) {
      riskLevel = 'high';
      message = `Vento extremo detectado: velocidade média de ${avgWindSpeed.toFixed(1)} m/s com pico de ${maxWindSpeed.toFixed(1)} m/s. Risco alto de derating ou danos aos painéis. Recomenda-se verificação dos sistemas.`;
    } else if (maxWindSpeed >= this.MEDIUM_RISK_THRESHOLD) {
      riskLevel = 'medium';
      message = `Vento forte: velocidade média de ${avgWindSpeed.toFixed(1)} m/s com pico de ${maxWindSpeed.toFixed(1)} m/s. Risco médio. Monitore as condições.`;
    } else {
      riskLevel = 'low';
      message = `Velocidade do vento média de ${avgWindSpeed.toFixed(1)} m/s. Condições normais. Sem risco significativo de derating por vento.`;
    }

    return {
      wind_speed_m_s: Math.round(avgWindSpeed * 10) / 10,
      risk_level: riskLevel,
      message,
      max_wind_speed: Math.round(maxWindSpeed * 10) / 10,
    };
  }
}

