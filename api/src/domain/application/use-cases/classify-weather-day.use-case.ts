import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors/resource-not-found-error";
import { WeatherLogRepository } from "../repositories/weather-log-repository";

interface ClassifyWeatherDayRequest {
  weatherLogId?: string;
  latest?: boolean;
}

export interface WeatherClassification {
  id: string;
  date: Date;
  classification: string;
  description: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  cloudCoverage: number;
  precipitationProbability: number;
}

type ClassifyWeatherDayResponse = Either<
  ResourceNotFoundError,
  {
    classification: WeatherClassification;
  }
>;

@Injectable()
export class ClassifyWeatherDayUseCase {
  constructor(private weatherLogRepository: WeatherLogRepository) {}

  async execute(
    request: ClassifyWeatherDayRequest
  ): Promise<ClassifyWeatherDayResponse> {
    let weatherLog;

    if (request.latest) {
      weatherLog = await this.weatherLogRepository.findLatest();
    } else if (request.weatherLogId) {
      weatherLog = await this.weatherLogRepository.findById(
        request.weatherLogId
      );
    }

    if (!weatherLog) {
      return left(new ResourceNotFoundError());
    }

    const classification = this.classifyWeatherConditions(weatherLog);

    return right({
      classification: {
        id: weatherLog.id.toString(),
        date: weatherLog.timestamp,
        classification: classification.type,
        description: classification.description,
        temperature: weatherLog.temperature,
        humidity: weatherLog.humidity,
        pressure: weatherLog.pressure,
        windSpeed: weatherLog.windSpeed,
        cloudCoverage: weatherLog.cloudCoverage,
        precipitationProbability: weatherLog.precipitationProbability,
      },
    });
  }

  private classifyWeatherConditions(weatherLog: any): {
    type: string;
    description: string;
  } {
    const {
      temperature,
      humidity,
      precipitationProbability,
      cloudCoverage,
      windSpeed,
    } = weatherLog;

    if (precipitationProbability >= 70) {
      return {
        type: "RAINY",
        description: "Dia chuvoso - Alta probabilidade de precipitação",
      };
    }

    if (temperature >= 30) {
      if (humidity >= 70) {
        return {
          type: "HOT_HUMID",
          description: "Dia quente e úmido - Desconforto térmico elevado",
        };
      }
      return {
        type: "HOT_DRY",
        description: "Dia quente e seco - Temperatura elevada",
      };
    }

    if (temperature <= 15) {
      if (windSpeed >= 20) {
        return {
          type: "COLD_WINDY",
          description: "Dia frio e ventoso - Sensação térmica reduzida",
        };
      }
      return {
        type: "COLD",
        description: "Dia frio - Temperatura baixa",
      };
    }

    if (cloudCoverage >= 80) {
      return {
        type: "CLOUDY",
        description: "Dia nublado - Alta cobertura de nuvens",
      };
    }

    if (cloudCoverage <= 20) {
      return {
        type: "SUNNY",
        description: "Dia ensolarado - Céu limpo",
      };
    }

    if (windSpeed >= 30) {
      return {
        type: "WINDY",
        description: "Dia ventoso - Ventos fortes",
      };
    }

    if (
      temperature >= 20 &&
      temperature <= 28 &&
      humidity >= 40 &&
      humidity <= 60 &&
      precipitationProbability <= 30 &&
      windSpeed <= 15
    ) {
      return {
        type: "PLEASANT",
        description: "Dia agradável - Condições climáticas ideais",
      };
    }

    return {
      type: "MODERATE",
      description: "Dia moderado - Condições climáticas normais",
    };
  }
}
