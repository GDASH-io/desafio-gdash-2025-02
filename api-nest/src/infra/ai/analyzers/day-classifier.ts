import { Injectable } from '@nestjs/common';
import { WeatherLog } from '../../../domain/entities/weather-log.entity';

export interface DayClassificationResult {
  classification: 'frio' | 'quente' | 'agradável' | 'chuvoso';
  confidence: number; // 0-100
  factors: {
    temp: number;
    humidity: number;
    precipitation: number;
    clouds: number;
  };
}

@Injectable()
export class DayClassifier {
  private readonly COLD_THRESHOLD = 15; // °C
  private readonly HOT_THRESHOLD = 30; // °C
  private readonly PLEASANT_HUMIDITY_MIN = 40; // %
  private readonly PLEASANT_HUMIDITY_MAX = 60; // %
  private readonly PLEASANT_CLOUDS_MAX = 50; // %
  private readonly RAINY_THRESHOLD = 5; // mm

  classify(logs: WeatherLog[]): DayClassificationResult {
    if (logs.length === 0) {
      return {
        classification: 'agradável',
        confidence: 0,
        factors: { temp: 0, humidity: 0, precipitation: 0, clouds: 0 },
      };
    }

    // Calcular médias
    const temps = logs
      .map((log) => log.temperature_c)
      .filter((t) => t != null && !isNaN(t));
    const humidities = logs
      .map((log) => log.relative_humidity)
      .filter((h) => h != null && !isNaN(h));
    const precipitations = logs
      .map((log) => log.precipitation_mm || 0)
      .filter((p) => p >= 0);
    const clouds = logs
      .map((log) => log.clouds_percent)
      .filter((c) => c != null && !isNaN(c));

    const avgTemp =
      temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 0;
    const avgHumidity =
      humidities.length > 0
        ? humidities.reduce((a, b) => a + b, 0) / humidities.length
        : 0;
    const totalPrecipitation =
      precipitations.length > 0
        ? precipitations.reduce((a, b) => a + b, 0)
        : 0;
    const avgClouds =
      clouds.length > 0 ? clouds.reduce((a, b) => a + b, 0) / clouds.length : 0;

    // Classificar
    let classification: 'frio' | 'quente' | 'agradável' | 'chuvoso';
    let confidence = 100;

    // Prioridade 1: Chuvoso
    if (totalPrecipitation >= this.RAINY_THRESHOLD) {
      classification = 'chuvoso';
      confidence = Math.min(100, 50 + totalPrecipitation * 5);
    }
    // Prioridade 2: Frio
    else if (avgTemp < this.COLD_THRESHOLD) {
      classification = 'frio';
      confidence = Math.min(100, 50 + (this.COLD_THRESHOLD - avgTemp) * 2);
    }
    // Prioridade 3: Quente
    else if (avgTemp > this.HOT_THRESHOLD) {
      classification = 'quente';
      confidence = Math.min(100, 50 + (avgTemp - this.HOT_THRESHOLD) * 2);
    }
    // Prioridade 4: Agradável (verificar condições ideais)
    else {
      classification = 'agradável';
      let factors = 0;
      let totalFactors = 3;

      // Temperatura no range ideal
      if (avgTemp >= this.COLD_THRESHOLD && avgTemp <= this.HOT_THRESHOLD) {
        factors++;
      }

      // Umidade no range ideal
      if (
        avgHumidity >= this.PLEASANT_HUMIDITY_MIN &&
        avgHumidity <= this.PLEASANT_HUMIDITY_MAX
      ) {
        factors++;
      }

      // Poucas nuvens
      if (avgClouds <= this.PLEASANT_CLOUDS_MAX) {
        factors++;
      }

      confidence = Math.round((factors / totalFactors) * 100);
    }

    return {
      classification,
      confidence,
      factors: {
        temp: Math.round(avgTemp * 10) / 10,
        humidity: Math.round(avgHumidity * 10) / 10,
        precipitation: Math.round(totalPrecipitation * 10) / 10,
        clouds: Math.round(avgClouds * 10) / 10,
      },
    };
  }
}

