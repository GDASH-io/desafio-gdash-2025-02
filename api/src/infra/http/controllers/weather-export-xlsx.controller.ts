import {
  Controller,
  Get,
  Query,
  Res,
  HttpCode,
  HttpStatus,
  UsePipes,
  Logger,
} from "@nestjs/common";
import { Response } from "express";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { exportWeatherLogsQuerySchema } from "../schemas/weather-log.schema";
import { ExportWeatherLogsXlsxUseCase } from "src/domain/application/use-cases/export-weather-logs-xlsx.use-case";

interface ExportQueryParams {
  startDate?: string;
  endDate?: string;
  location?: string;
}

@Controller("api/weather")
export class WeatherExportXLSXController {
  private readonly logger = new Logger(WeatherExportXLSXController.name);

  constructor(private exportWeatherLogsXlsx: ExportWeatherLogsXlsxUseCase) {}

  @Get("export/xlsx")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(exportWeatherLogsQuerySchema))
  async exportXLSX(
    @Query() query: ExportQueryParams,
    @Res() res: Response
  ): Promise<void> {
    this.logger.log("Exportando dados em XLSX...");

    const result = await this.exportWeatherLogsXlsx.execute({
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      location: query.location,
    });

    if (result.isRight()) {
      const { buffer, filename } = result.value;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.send(buffer);

      this.logger.log(`XLSX exportado com sucesso: ${filename}`);
    }
  }
}
