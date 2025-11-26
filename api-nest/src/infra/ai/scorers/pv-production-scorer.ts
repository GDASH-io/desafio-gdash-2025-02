import { Injectable } from '@nestjs/common';

export interface PVProductionScoreResult {
  pv_production_score: number; // 0-100
  estimated_production_kwh: number;
  factors: {
    irradiance_score: number;
    temp_penalty: number;
    clouds_penalty: number;
    soiling_penalty: number;
  };
}

@Injectable()
export class PVProductionScorer {
  private readonly BASE_IRRADIANCE = 1000; // W/m² (STC)
  private readonly IDEAL_TEMP = 25; // °C
  private readonly BASE_PRODUCTION_KWH = 100; // kWh base para cálculo

  calculate(data: {
    avg_irradiance: number;
    avg_temp: number;
    avg_clouds: number;
    soiling_risk_score: number;
  }): PVProductionScoreResult {
    // Score baseado em irradiância (0-40 pontos)
    const irradianceRatio = Math.min(1, data.avg_irradiance / this.BASE_IRRADIANCE);
    const irradianceScore = irradianceRatio * 40;

    // Penalidade por temperatura (0-20 pontos)
    let tempPenalty = 20;
    if (data.avg_temp > this.IDEAL_TEMP) {
      // Derating por calor
      const diff = data.avg_temp - this.IDEAL_TEMP;
      tempPenalty = Math.max(0, 20 - diff * 0.4);
    } else if (data.avg_temp < this.IDEAL_TEMP) {
      // Temperatura abaixo do ideal também reduz eficiência
      const diff = this.IDEAL_TEMP - data.avg_temp;
      tempPenalty = Math.max(0, 20 - diff * 0.2);
    }

    // Penalidade por nuvens (0-20 pontos)
    const cloudsPenalty = Math.max(0, 20 - (data.avg_clouds / 100) * 20);

    // Penalidade por sujeira (0-20 pontos)
    const soilingPenalty = Math.max(0, 20 - (data.soiling_risk_score / 100) * 20);

    const pvProductionScore = Math.round(
      Math.min(100, irradianceScore + tempPenalty + cloudsPenalty + soilingPenalty),
    );

    // Estimar produção em kWh
    const productionRatio = pvProductionScore / 100;
    const estimatedProductionKwh = this.BASE_PRODUCTION_KWH * productionRatio;

    return {
      pv_production_score: pvProductionScore,
      estimated_production_kwh: Math.round(estimatedProductionKwh * 10) / 10,
      factors: {
        irradiance_score: Math.round(irradianceScore),
        temp_penalty: Math.round(tempPenalty),
        clouds_penalty: Math.round(cloudsPenalty),
        soiling_penalty: Math.round(soilingPenalty),
      },
    };
  }
}

