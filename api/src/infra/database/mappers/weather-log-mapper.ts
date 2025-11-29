import { WeatherLog } from "src/domain/enterprise/entities/weather-log";
import { WeatherLogDocument } from "../schemas/weather-log.schema";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export class WeatherLogMapper {
  static toDomain(raw: WeatherLogDocument): WeatherLog {
    return WeatherLog.create(
      {
        temperature: raw.temperature,
        humidity: raw.humidity,
        windSpeed: raw.windSpeed,
        skyCondition: raw.skyCondition,
        rainProbability: raw.rainProbability,
        location: raw.location,
        collectedAt: raw.collectedAt,
        createdAt: raw.createdAt ?? new Date(),
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw._id.toString())
    );
  }

  static toPersistence(weatherLog: WeatherLog): any {
    return {
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
