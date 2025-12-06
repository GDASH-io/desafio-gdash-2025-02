import { WeatherLog } from "src/domain/enterprise/entities/weather-log";

export class WeatherLogPresenter {
  static toHTTP(weatherLog: WeatherLog) {
    return {
      id: weatherLog.id.toString(),
      temperature: weatherLog.temperature,
      humidity: weatherLog.humidity,
      windSpeed: weatherLog.windSpeed,
      skyCondition: weatherLog.skyCondition,
      rainProbability: weatherLog.rainProbability,
      location: weatherLog.location,
      collectedAt: weatherLog.collectedAt,
      createdAt: weatherLog.createdAt,
      updatedAt: weatherLog.updatedAt,
    };
  }
}
