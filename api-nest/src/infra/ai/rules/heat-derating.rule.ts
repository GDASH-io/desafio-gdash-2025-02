import { Injectable } from '@nestjs/common';
import { WeatherLog } from '../../../domain/entities/weather-log.entity';

export interface HeatDeratingResult {
  temp_c: number;
  derating_pct: number;
  message: string;
  avg_temp: number;
}

@Injectable()
export class HeatDeratingRule {
  private readonly BASE_TEMP = 25; // Temperatura base para cálculo (STC)
  private readonly DERATING_COEFFICIENT = 0.004; // Coeficiente típico de derating por grau acima de 25°C
  private readonly HIGH_TEMP_THRESHOLD = 35; // °C para considerar calor extremo

  calculate(logs: WeatherLog[]): HeatDeratingResult {
    if (logs.length === 0) {
      return {
        temp_c: 0,
        derating_pct: 0,
        message: 'Sem dados suficientes para calcular derating por calor.',
        avg_temp: 0,
      };
    }

    // Calcular temperatura média
    const temps = logs
      .map((log) => log.temperature_c)
      .filter((t) => t != null && !isNaN(t));

    if (temps.length === 0) {
      return {
        temp_c: 0,
        derating_pct: 0,
        message: 'Sem dados de temperatura disponíveis.',
        avg_temp: 0,
      };
    }

    const avgTemp =
      temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
    const maxTemp = Math.max(...temps);

    // Calcular derating baseado na temperatura média
    // Fórmula: derating = (temp - 25) * 0.004 * 100 (em %)
    let deratingPct = 0;
    if (avgTemp > this.BASE_TEMP) {
      deratingPct = (avgTemp - this.BASE_TEMP) * this.DERATING_COEFFICIENT * 100;
    }

    let message: string;
    if (maxTemp >= this.HIGH_TEMP_THRESHOLD) {
      message = `Temperatura média de ${avgTemp.toFixed(1)}°C com pico de ${maxTemp.toFixed(1)}°C. Calor extremo detectado. Derating estimado: ${deratingPct.toFixed(1)}%. A eficiência dos painéis está reduzida devido à alta temperatura.`;
    } else if (avgTemp > this.BASE_TEMP) {
      message = `Temperatura média de ${avgTemp.toFixed(1)}°C acima da temperatura padrão (25°C). Derating estimado: ${deratingPct.toFixed(1)}%.`;
    } else {
      message = `Temperatura média de ${avgTemp.toFixed(1)}°C. Condições ideais para produção de energia solar. Sem derating significativo por calor.`;
    }

    return {
      temp_c: Math.round(avgTemp * 10) / 10,
      derating_pct: Math.round(deratingPct * 10) / 10,
      message,
      avg_temp: Math.round(avgTemp * 10) / 10,
    };
  }
}

