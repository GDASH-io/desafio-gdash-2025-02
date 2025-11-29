import { Injectable } from "@nestjs/common";
import { WeatherLogRepository } from "../repositories/weather-log-repository";
import { WeatherLog } from "src/domain/enterprise/entities/weather-log";
import { Either, right } from "src/core/either";

interface CreateWeatherLogUseCaseRequest {
  timestamp: string;
  location: {
    latitude: string;
    longitude: string;
    city: string;
    state: string;
  };
  weather: {
    temperature: number;
    temperature_unit: string;
    humidity: number;
    humidity_unit: string;
    wind_speed: number;
    wind_speed_unit: string;
    condition: string;
    weather_code: number;
    precipitation: number;
    precipitation_unit: string;
    rain_probability: number;
  };
}

interface CreateWeatherLogUseCaseResponse {
  weatherLog: WeatherLog;
}

@Injectable()
export class CreateWeatherLogUseCase {
  constructor(private weatherLogRepository: WeatherLogRepository) {}

  async execute(
    request: CreateWeatherLogUseCaseRequest
  ): Promise<Either<null, CreateWeatherLogUseCaseResponse>> {
    const weatherLog = WeatherLog.create({
      temperature: request.weather.temperature,
      humidity: request.weather.humidity,
      windSpeed: request.weather.wind_speed,
      skyCondition: request.weather.condition,
      rainProbability: request.weather.rain_probability,
      location: `${request.location.city}, ${request.location.state}`,
      collectedAt: new Date(request.timestamp),
      createdAt: new Date(),
    });

    await this.weatherLogRepository.create(weatherLog);

    return right({
      weatherLog,
    });
  }
}
