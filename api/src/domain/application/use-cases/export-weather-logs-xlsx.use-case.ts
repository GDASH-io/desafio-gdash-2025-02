import { Injectable } from "@nestjs/common";
import { WeatherLogRepository } from "../repositories/weather-log-repository";
import { Either, right } from "src/core/either";
import * as XLSX from "xlsx";

interface ExportWeatherLogsXlsxUseCaseRequest {
  startDate?: Date;
  endDate?: Date;
  location?: string;
}

interface ExportWeatherLogsXlsxUseCaseResponse {
  buffer: Buffer;
  filename: string;
}

@Injectable()
export class ExportWeatherLogsXlsxUseCase {
  constructor(private weatherLogRepository: WeatherLogRepository) {}

  async execute(
    request: ExportWeatherLogsXlsxUseCaseRequest
  ): Promise<Either<null, ExportWeatherLogsXlsxUseCaseResponse>> {
    const result = await this.weatherLogRepository.findMany({
      page: 1,
      limit: 10000,
      startDate: request.startDate,
      endDate: request.endDate,
      location: request.location,
    });

    const worksheetData = result.data.map((log) => ({
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

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    const columnWidths = [
      { wch: 38 },
      { wch: 20 },
      { wch: 15 },
      { wch: 18 },
      { wch: 12 },
      { wch: 25 },
      { wch: 20 },
      { wch: 25 },
      { wch: 20 },
    ];
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Weather Logs");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const date = new Date().toISOString().split("T")[0];
    const filename = `weather-logs-${date}.xlsx`;

    return right({
      buffer: Buffer.from(buffer),
      filename,
    });
  }
}
