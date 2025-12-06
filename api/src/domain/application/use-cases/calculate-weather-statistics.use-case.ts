import { Injectable } from "@nestjs/common";
import { WeatherLogRepository } from "../repositories/weather-log-repository";
import { Either, right } from "src/core/either";

export interface CalculateWeatherStatisticsRequest {
  startDate?: Date;
  endDate?: Date;
  location?: string;
}

export interface WeatherStatistics {
  temperature: {
    average: number;
    min: number;
    max: number;
    unit: string;
  };
  humidity: {
    average: number;
    min: number;
    max: number;
    unit: string;
  };
  windSpeed: {
    average: number;
    min: number;
    max: number;
    unit: string;
  };
  rainProbability: {
    average: number;
    unit: string;
  };
  dataPointsAnalyzed: number;
  period: {
    start: Date | null;
    end: Date | null;
  };
}

export interface CalculateWeatherStatisticsResponse {
  statistics: WeatherStatistics;
}

@Injectable()
export class CalculateWeatherStatisticsUseCase {
  constructor(private weatherLogRepository: WeatherLogRepository) {}

  async execute(
    request: CalculateWeatherStatisticsRequest
  ): Promise<Either<null, CalculateWeatherStatisticsResponse>> {
    const result = await this.weatherLogRepository.findMany({
      page: 1,
      limit: 1000,
      startDate: request.startDate,
      endDate: request.endDate,
      location: request.location,
    });

    if (result.data.length === 0) {
      return right({
        statistics: this.getEmptyStatistics(),
      });
    }

    const logs = result.data;

    const temperatures = logs.map((log) => log.temperature);
    const temperatureStats = {
      average: this.calculateAverage(temperatures),
      min: Math.min(...temperatures),
      max: Math.max(...temperatures),
      unit: "°C",
    };

    const humidities = logs.map((log) => log.humidity);
    const humidityStats = {
      average: this.calculateAverage(humidities),
      min: Math.min(...humidities),
      max: Math.max(...humidities),
      unit: "%",
    };

    const windSpeeds = logs.map((log) => log.windSpeed);
    const windSpeedStats = {
      average: this.calculateAverage(windSpeeds),
      min: Math.min(...windSpeeds),
      max: Math.max(...windSpeeds),
      unit: "km/h",
    };

    const rainProbabilities = logs.map((log) => log.rainProbability);
    const rainProbabilityStats = {
      average: this.calculateAverage(rainProbabilities),
      unit: "%",
    };

    const dates = logs.map((log) => log.collectedAt);
    const period = {
      start: new Date(Math.min(...dates.map((d) => d.getTime()))),
      end: new Date(Math.max(...dates.map((d) => d.getTime()))),
    };

    return right({
      statistics: {
        temperature: temperatureStats,
        humidity: humidityStats,
        windSpeed: windSpeedStats,
        rainProbability: rainProbabilityStats,
        dataPointsAnalyzed: logs.length,
        period,
      },
    });
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / values.length) * 10) / 10;
  }

  private getEmptyStatistics(): WeatherStatistics {
    return {
      temperature: { average: 0, min: 0, max: 0, unit: "°C" },
      humidity: { average: 0, min: 0, max: 0, unit: "%" },
      windSpeed: { average: 0, min: 0, max: 0, unit: "km/h" },
      rainProbability: { average: 0, unit: "%" },
      dataPointsAnalyzed: 0,
      period: { start: null, end: null },
    };
  }
}
