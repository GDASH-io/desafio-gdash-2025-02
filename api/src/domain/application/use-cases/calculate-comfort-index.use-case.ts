import { Injectable } from "@nestjs/common";
import { WeatherLogRepository } from "../repositories/weather-log-repository";
import { Either, left, right } from "src/core/either";
import { ResourceNotFoundError } from "src/core/errors/resource-not-found-error";

export interface CalculateComfortIndexRequest {
  weatherLogId?: string;
  latest?: boolean;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
}

export type ComfortClassification =
  | "muito_desconfortavel"
  | "desconfortavel"
  | "confortavel"
  | "muito_confortavel";

export interface ComfortIndex {
  score: number;
  classification: ComfortClassification;
  factors: {
    temperature: {
      value: number;
      contribution: number;
      status: "ideal" | "alto" | "baixo";
    };
    humidity: {
      value: number;
      contribution: number;
      status: "ideal" | "alto" | "baixo";
    };
    windSpeed: {
      value: number;
      contribution: number;
      status: "ideal" | "alto" | "baixo";
    };
  };
  recommendations: string[];
}

export interface CalculateComfortIndexResponse {
  comfortIndex: ComfortIndex;
}

@Injectable()
export class CalculateComfortIndexUseCase {
  constructor(private weatherLogRepository: WeatherLogRepository) {}

  async execute(
    request: CalculateComfortIndexRequest
  ): Promise<Either<ResourceNotFoundError, CalculateComfortIndexResponse>> {
    let temperature: number;
    let humidity: number;
    let windSpeed: number;

    if (
      request.temperature !== undefined &&
      request.humidity !== undefined &&
      request.windSpeed !== undefined
    ) {
      temperature = request.temperature;
      humidity = request.humidity;
      windSpeed = request.windSpeed;
    } else {
      let weatherLog;

      if (request.weatherLogId) {
        weatherLog = await this.weatherLogRepository.findById(
          request.weatherLogId
        );
      } else {
        const result = await this.weatherLogRepository.findMany({
          page: 1,
          limit: 1,
        });
        weatherLog = result.data[0] || null;
      }

      if (!weatherLog) {
        return left(new ResourceNotFoundError());
      }

      temperature = weatherLog.temperature;
      humidity = weatherLog.humidity;
      windSpeed = weatherLog.windSpeed;
    }

    const comfortIndex = this.calculate(temperature, humidity, windSpeed);

    return right({
      comfortIndex,
    });
  }

  private calculate(
    temperature: number,
    humidity: number,
    windSpeed: number
  ): ComfortIndex {
    let score = 100;

    const tempContribution = this.analyzeTemperature(temperature);
    score += tempContribution.contribution;

    const humidityContribution = this.analyzeHumidity(humidity);
    score += humidityContribution.contribution;

    const windContribution = this.analyzeWindSpeed(windSpeed);
    score += windContribution.contribution;

    score = Math.max(0, Math.min(100, score));

    const classification = this.getClassification(score);

    const recommendations = this.generateRecommendations(
      temperature,
      humidity,
      windSpeed,
      classification
    );

    return {
      score: Math.round(score),
      classification,
      factors: {
        temperature: {
          value: temperature,
          contribution: Math.round(tempContribution.contribution),
          status: tempContribution.status,
        },
        humidity: {
          value: humidity,
          contribution: Math.round(humidityContribution.contribution),
          status: humidityContribution.status,
        },
        windSpeed: {
          value: windSpeed,
          contribution: Math.round(windContribution.contribution),
          status: windContribution.status,
        },
      },
      recommendations,
    };
  }

  private analyzeTemperature(temp: number): {
    contribution: number;
    status: "ideal" | "alto" | "baixo";
  } {
    const ideal = 23;
    const tolerance = 3;

    if (temp >= 20 && temp <= 26) {
      return { contribution: 0, status: "ideal" };
    }

    const deviation = Math.abs(temp - ideal);

    if (temp < 20) {
      const contribution = -Math.min(30, (20 - temp) * 2);
      return { contribution, status: "baixo" };
    } else {
      const contribution = -Math.min(30, (temp - 26) * 2);
      return { contribution, status: "alto" };
    }
  }

  private analyzeHumidity(humidity: number): {
    contribution: number;
    status: "ideal" | "alto" | "baixo";
  } {
    if (humidity >= 40 && humidity <= 60) {
      return { contribution: 0, status: "ideal" };
    }

    if (humidity < 40) {
      const contribution = -Math.min(20, (40 - humidity) * 0.5);
      return { contribution, status: "baixo" };
    } else {
      const contribution = -Math.min(20, (humidity - 60) * 0.5);
      return { contribution, status: "alto" };
    }
  }

  private analyzeWindSpeed(wind: number): {
    contribution: number;
    status: "ideal" | "alto" | "baixo";
  } {
    if (wind >= 5 && wind <= 15) {
      return { contribution: 0, status: "ideal" };
    }

    if (wind < 5) {
      const contribution = -Math.min(10, (5 - wind) * 2);
      return { contribution, status: "baixo" };
    } else {
      const contribution = -Math.min(15, (wind - 15) * 1);
      return { contribution, status: "alto" };
    }
  }

  private getClassification(score: number): ComfortClassification {
    if (score >= 80) return "muito_confortavel";
    if (score >= 60) return "confortavel";
    if (score >= 40) return "desconfortavel";
    return "muito_desconfortavel";
  }

  private generateRecommendations(
    temp: number,
    humidity: number,
    wind: number,
    classification: ComfortClassification
  ): string[] {
    const recommendations: string[] = [];

    if (temp < 18) {
      recommendations.push("Vista roupas quentes e agasalhos");
    } else if (temp > 30) {
      recommendations.push("Use roupas leves e clara");
      recommendations.push("Evite exposição prolongada ao sol");
    } else if (temp > 26) {
      recommendations.push("Use protetor solar");
    }

    if (humidity < 30) {
      recommendations.push("Mantenha-se bem hidratado");
      recommendations.push("Use hidratante para pele");
    } else if (humidity > 70) {
      recommendations.push("Ambiente pode estar abafado");
      if (temp > 25) {
        recommendations.push("Busque locais com ar condicionado");
      }
    }

    if (wind > 30) {
      recommendations.push("Cuidado com objetos soltos");
      recommendations.push("Proteja-se de poeira e detritos");
    } else if (wind < 3) {
      recommendations.push("Ar pode estar parado, ventile ambientes");
    }

    if (classification === "muito_confortavel") {
      recommendations.push("Condições ideais para atividades ao ar livre");
    } else if (classification === "muito_desconfortavel") {
      recommendations.push("Evite atividades físicas intensas");
    }

    return recommendations;
  }
}
