import { Injectable } from "@nestjs/common";
import { WeatherLogRepository } from "../repositories/weather-log-repository";
import { Either, right } from "src/core/either";

export interface GenerateWeatherAlertsRequest {
  startDate?: Date;
  endDate?: Date;
  location?: string;
}

export type AlertSeverity = "info" | "warning" | "danger";
export type AlertType = "rain" | "heat" | "cold" | "wind" | "humidity";

export interface WeatherAlert {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: Date;
  data: {
    current: number;
    threshold: number;
    unit: string;
  };
}

export interface GenerateWeatherAlertsResponse {
  alerts: WeatherAlert[];
  hasActiveAlerts: boolean;
  generatedAt: Date;
}

@Injectable()
export class GenerateWeatherAlertsUseCase {
  private readonly THRESHOLDS = {
    RAIN_PROBABILITY_HIGH: 70,
    RAIN_PROBABILITY_WARNING: 50,
    TEMPERATURE_HOT_DANGER: 38,
    TEMPERATURE_HOT_WARNING: 35,
    TEMPERATURE_COLD_DANGER: 10,
    TEMPERATURE_COLD_WARNING: 15,
    HUMIDITY_HIGH: 85,
    HUMIDITY_LOW: 25,
    WIND_SPEED_HIGH: 40,
  };

  constructor(private weatherLogRepository: WeatherLogRepository) {}

  async execute(
    request: GenerateWeatherAlertsRequest
  ): Promise<Either<null, GenerateWeatherAlertsResponse>> {
    const result = await this.weatherLogRepository.findMany({
      page: 1,
      limit: 10,
      startDate: request.startDate,
      endDate: request.endDate,
      location: request.location,
    });

    const alerts: WeatherAlert[] = [];

    if (result.data.length === 0) {
      return right({
        alerts: [],
        hasActiveAlerts: false,
        generatedAt: new Date(),
      });
    }

    const latestLog = result.data[0];

    if (latestLog.rainProbability >= this.THRESHOLDS.RAIN_PROBABILITY_HIGH) {
      alerts.push({
        type: "rain",
        severity: "danger",
        title: "⚠️ Alta Chance de Chuva",
        message: `Probabilidade de ${latestLog.rainProbability}% de chuva. Leve guarda-chuva!`,
        timestamp: latestLog.collectedAt,
        data: {
          current: latestLog.rainProbability,
          threshold: this.THRESHOLDS.RAIN_PROBABILITY_HIGH,
          unit: "%",
        },
      });
    } else if (
      latestLog.rainProbability >= this.THRESHOLDS.RAIN_PROBABILITY_WARNING
    ) {
      alerts.push({
        type: "rain",
        severity: "warning",
        title: "🌧️ Possibilidade de Chuva",
        message: `${latestLog.rainProbability}% de chance de chuva.`,
        timestamp: latestLog.collectedAt,
        data: {
          current: latestLog.rainProbability,
          threshold: this.THRESHOLDS.RAIN_PROBABILITY_WARNING,
          unit: "%",
        },
      });
    }

    if (latestLog.temperature >= this.THRESHOLDS.TEMPERATURE_HOT_DANGER) {
      alerts.push({
        type: "heat",
        severity: "danger",
        title: "🔥 Calor Extremo",
        message: `Temperatura de ${latestLog.temperature}°C! Evite exposição ao sol e mantenha-se hidratado.`,
        timestamp: latestLog.collectedAt,
        data: {
          current: latestLog.temperature,
          threshold: this.THRESHOLDS.TEMPERATURE_HOT_DANGER,
          unit: "°C",
        },
      });
    } else if (
      latestLog.temperature >= this.THRESHOLDS.TEMPERATURE_HOT_WARNING
    ) {
      alerts.push({
        type: "heat",
        severity: "warning",
        title: "☀️ Calor Intenso",
        message: `Temperatura de ${latestLog.temperature}°C. Use protetor solar.`,
        timestamp: latestLog.collectedAt,
        data: {
          current: latestLog.temperature,
          threshold: this.THRESHOLDS.TEMPERATURE_HOT_WARNING,
          unit: "°C",
        },
      });
    }

    if (latestLog.temperature <= this.THRESHOLDS.TEMPERATURE_COLD_DANGER) {
      alerts.push({
        type: "cold",
        severity: "danger",
        title: "❄️ Frio Intenso",
        message: `Temperatura de ${latestLog.temperature}°C! Vista-se adequadamente.`,
        timestamp: latestLog.collectedAt,
        data: {
          current: latestLog.temperature,
          threshold: this.THRESHOLDS.TEMPERATURE_COLD_DANGER,
          unit: "°C",
        },
      });
    } else if (
      latestLog.temperature <= this.THRESHOLDS.TEMPERATURE_COLD_WARNING
    ) {
      alerts.push({
        type: "cold",
        severity: "warning",
        title: "🧥 Tempo Frio",
        message: `Temperatura de ${latestLog.temperature}°C. Leve um casaco.`,
        timestamp: latestLog.collectedAt,
        data: {
          current: latestLog.temperature,
          threshold: this.THRESHOLDS.TEMPERATURE_COLD_WARNING,
          unit: "°C",
        },
      });
    }

    if (latestLog.humidity >= this.THRESHOLDS.HUMIDITY_HIGH) {
      alerts.push({
        type: "humidity",
        severity: "warning",
        title: "💧 Umidade Muito Alta",
        message: `Umidade de ${latestLog.humidity}%. Sensação de abafamento.`,
        timestamp: latestLog.collectedAt,
        data: {
          current: latestLog.humidity,
          threshold: this.THRESHOLDS.HUMIDITY_HIGH,
          unit: "%",
        },
      });
    } else if (latestLog.humidity <= this.THRESHOLDS.HUMIDITY_LOW) {
      alerts.push({
        type: "humidity",
        severity: "info",
        title: "🏜️ Ar Seco",
        message: `Umidade de ${latestLog.humidity}%. Hidrate-se e use hidratante.`,
        timestamp: latestLog.collectedAt,
        data: {
          current: latestLog.humidity,
          threshold: this.THRESHOLDS.HUMIDITY_LOW,
          unit: "%",
        },
      });
    }

    if (latestLog.windSpeed >= this.THRESHOLDS.WIND_SPEED_HIGH) {
      alerts.push({
        type: "wind",
        severity: "warning",
        title: "💨 Ventos Fortes",
        message: `Ventos de ${latestLog.windSpeed} km/h. Cuidado com objetos soltos.`,
        timestamp: latestLog.collectedAt,
        data: {
          current: latestLog.windSpeed,
          threshold: this.THRESHOLDS.WIND_SPEED_HIGH,
          unit: "km/h",
        },
      });
    }

    return right({
      alerts,
      hasActiveAlerts: alerts.length > 0,
      generatedAt: new Date(),
    });
  }
}
