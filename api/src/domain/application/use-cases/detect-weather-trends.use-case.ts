import { Injectable } from "@nestjs/common";
import { WeatherLogRepository } from "../repositories/weather-log-repository";
import { Either, right } from "src/core/either";

export interface DetectWeatherTrendsRequest {
  startDate?: Date;
  endDate?: Date;
  location?: string;
  minimumDataPoints?: number;
}

export type TrendDirection = "rising" | "falling" | "stable";
export type TrendMetric =
  | "temperature"
  | "humidity"
  | "windSpeed"
  | "rainProbability";

export interface WeatherTrend {
  metric: TrendMetric;
  direction: TrendDirection;
  changeRate: number;
  confidence: number;
  description: string;
}

export interface DetectWeatherTrendsResponse {
  trends: WeatherTrend[];
  summary: string;
  dataPointsAnalyzed: number;
}

@Injectable()
export class DetectWeatherTrendsUseCase {
  constructor(private weatherLogRepository: WeatherLogRepository) {}

  async execute(
    request: DetectWeatherTrendsRequest
  ): Promise<Either<null, DetectWeatherTrendsResponse>> {
    const minimumDataPoints = request.minimumDataPoints || 5;

    const result = await this.weatherLogRepository.findMany({
      page: 1,
      limit: 100,
      startDate: request.startDate,
      endDate: request.endDate,
      location: request.location,
    });

    if (result.data.length < minimumDataPoints) {
      return right({
        trends: [],
        summary: `Dados insuficientes para análise de tendências (mínimo ${minimumDataPoints} pontos necessários).`,
        dataPointsAnalyzed: result.data.length,
      });
    }

    const logs = result.data.sort(
      (a, b) => a.collectedAt.getTime() - b.collectedAt.getTime()
    );

    const trends: WeatherTrend[] = [
      this.analyzeTrend(
        "temperature",
        logs.map((l) => l.temperature),
        "°C"
      ),
      this.analyzeTrend(
        "humidity",
        logs.map((l) => l.humidity),
        "%"
      ),
      this.analyzeTrend(
        "windSpeed",
        logs.map((l) => l.windSpeed),
        "km/h"
      ),
      this.analyzeTrend(
        "rainProbability",
        logs.map((l) => l.rainProbability),
        "%"
      ),
    ];

    const summary = this.generateSummary(trends);

    return right({
      trends,
      summary,
      dataPointsAnalyzed: logs.length,
    });
  }

  private analyzeTrend(
    metric: TrendMetric,
    values: number[],
    unit: string
  ): WeatherTrend {
    if (values.length < 2) {
      return {
        metric,
        direction: "stable",
        changeRate: 0,
        confidence: 0,
        description: "Dados insuficientes",
      };
    }

    const n = values.length;
    const indices = Array.from({ length: n }, (_, i) => i);

    const sumX = indices.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const changeRate = ((lastValue - firstValue) / firstValue) * 100;

    let direction: TrendDirection;
    const threshold = 0.05;

    if (Math.abs(changeRate) < threshold) {
      direction = "stable";
    } else if (slope > 0) {
      direction = "rising";
    } else {
      direction = "falling";
    }

    const confidence = this.calculateConfidence(values, slope);

    const description = this.generateTrendDescription(
      metric,
      direction,
      changeRate,
      unit
    );

    return {
      metric,
      direction,
      changeRate: Math.round(changeRate * 10) / 10,
      confidence: Math.round(confidence),
      description,
    };
  }

  private calculateConfidence(values: number[], slope: number): number {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;

    let ssTotal = 0;
    let ssResidual = 0;

    values.forEach((value, i) => {
      const predicted = slope * i + (mean - (slope * (n - 1)) / 2);
      ssTotal += Math.pow(value - mean, 2);
      ssResidual += Math.pow(value - predicted, 2);
    });

    const rSquared = ssTotal === 0 ? 0 : 1 - ssResidual / ssTotal;

    return Math.max(0, Math.min(100, rSquared * 100));
  }

  private generateTrendDescription(
    metric: TrendMetric,
    direction: TrendDirection,
    changeRate: number,
    unit: string
  ): string {
    const metricNames = {
      temperature: "Temperatura",
      humidity: "Umidade",
      windSpeed: "Velocidade do vento",
      rainProbability: "Probabilidade de chuva",
    };

    const directionText = {
      rising: "em elevação",
      falling: "em queda",
      stable: "estável",
    };

    const metricName = metricNames[metric];
    const dirText = directionText[direction];

    if (direction === "stable") {
      return `${metricName} permanece ${dirText}`;
    }

    const absChange = Math.abs(changeRate);
    return `${metricName} ${dirText} (${absChange.toFixed(1)}% no período)`;
  }

  private generateSummary(trends: WeatherTrend[]): string {
    const significantTrends = trends.filter(
      (t) => t.direction !== "stable" && t.confidence > 50
    );

    if (significantTrends.length === 0) {
      return "Condições climáticas estáveis no período analisado.";
    }

    const descriptions = significantTrends
      .map((t) => t.description.toLowerCase())
      .join(", ");

    return `Tendências detectadas: ${descriptions}.`;
  }
}
