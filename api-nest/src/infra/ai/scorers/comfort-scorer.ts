import { Injectable } from '@nestjs/common';

export interface ComfortScoreResult {
  comfort_score: number; // 0-100
  factors: {
    temp_score: number;
    humidity_score: number;
    precipitation_penalty: number;
  };
}

@Injectable()
export class ComfortScorer {
  private readonly IDEAL_TEMP_MIN = 20; // °C
  private readonly IDEAL_TEMP_MAX = 25; // °C
  private readonly IDEAL_HUMIDITY_MIN = 40; // %
  private readonly IDEAL_HUMIDITY_MAX = 60; // %

  calculate(data: {
    avg_temp: number;
    avg_humidity: number;
    total_precipitation: number;
  }): ComfortScoreResult {
    // Score de temperatura (0-50 pontos)
    let tempScore = 50;
    if (data.avg_temp < this.IDEAL_TEMP_MIN) {
      // Muito frio: penalidade proporcional
      const diff = this.IDEAL_TEMP_MIN - data.avg_temp;
      tempScore = Math.max(0, 50 - diff * 2);
    } else if (data.avg_temp > this.IDEAL_TEMP_MAX) {
      // Muito quente: penalidade proporcional
      const diff = data.avg_temp - this.IDEAL_TEMP_MAX;
      tempScore = Math.max(0, 50 - diff * 2);
    }

    // Score de umidade (0-30 pontos)
    let humidityScore = 30;
    if (data.avg_humidity < this.IDEAL_HUMIDITY_MIN) {
      // Muito seco
      const diff = this.IDEAL_HUMIDITY_MIN - data.avg_humidity;
      humidityScore = Math.max(0, 30 - diff * 0.5);
    } else if (data.avg_humidity > this.IDEAL_HUMIDITY_MAX) {
      // Muito úmido
      const diff = data.avg_humidity - this.IDEAL_HUMIDITY_MAX;
      humidityScore = Math.max(0, 30 - diff * 0.5);
    }

    // Penalidade por precipitação (0-20 pontos)
    let precipitationPenalty = 20;
    if (data.total_precipitation > 0) {
      // Penalidade proporcional à precipitação
      precipitationPenalty = Math.max(0, 20 - data.total_precipitation * 2);
    }

    const comfortScore = Math.round(
      Math.min(100, tempScore + humidityScore + precipitationPenalty),
    );

    return {
      comfort_score: comfortScore,
      factors: {
        temp_score: Math.round(tempScore),
        humidity_score: Math.round(humidityScore),
        precipitation_penalty: Math.round(precipitationPenalty),
      },
    };
  }
}

