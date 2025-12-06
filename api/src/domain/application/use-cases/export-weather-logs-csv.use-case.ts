import { Injectable } from "@nestjs/common";
import { Either, right } from "src/core/either";
import { WeatherLogRepository } from "../repositories/weather-log-repository";
import * as Papa from "papaparse";

interface ExportWeatherLogsCsvUseCaseRequest {
  startDate?: Date;
  endDate?: Date;
  location?: string;
}

interface ExportWeatherLogsCsvUseCaseResponse {
  csv: string;
  filename: string;
}

@Injectable()
export class ExportWeatherLogsCsvUseCase {
  constructor(private weatherLogRepository: WeatherLogRepository) {}

  async execute(
    request: ExportWeatherLogsCsvUseCaseRequest
  ): Promise<Either<null, ExportWeatherLogsCsvUseCaseResponse>> {
    const { startDate, endDate, location } = request;

    const result = await this.weatherLogRepository.findMany({
      startDate,
      endDate,
      location,
      page: 1,
      limit: 999999,
    });

    const csvData = result.data.map((log) => ({
      ID: log.id.toString(),
      Data: log.collectedAt.toISOString(),
      Localização: log.location,
      "Temperatura (°C)": log.temperature,
      "Umidade (%)": log.humidity,
      "Velocidade do Vento (km/h)": log.windSpeed,
      "Condição do Céu": log.skyCondition,
      "Probabilidade de Chuva (%)": log.rainProbability,
      "Criado em": log.createdAt.toISOString(),
    }));

    const csv = Papa.unparse(csvData, {
      quotes: true,
      delimiter: ",",
      header: true,
    });

    const timestamp = new Date().toISOString().split("T")[0];
    const locationSuffix = location ? `-${location.toLowerCase()}` : "";
    const filename = `weather-logs${locationSuffix}-${timestamp}.csv`;

    return right({
      csv,
      filename,
    });
  }
}
