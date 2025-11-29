import { Injectable } from "@nestjs/common";
import {
  WeatherLogRepository,
  FindManyParams,
} from "../repositories/weather-log-repository";
import { WeatherLog } from "src/domain/enterprise/entities/weather-log";
import { Either, right } from "src/core/either";

interface ListWeatherLogsUseCaseRequest extends FindManyParams {}

interface ListWeatherLogsUseCaseResponse {
  logs: WeatherLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class ListWeatherLogsUseCase {
  constructor(private weatherLogRepository: WeatherLogRepository) {}

  async execute(
    request: ListWeatherLogsUseCaseRequest
  ): Promise<Either<null, ListWeatherLogsUseCaseResponse>> {
    const result = await this.weatherLogRepository.findMany(request);

    return right({
      logs: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  }
}
