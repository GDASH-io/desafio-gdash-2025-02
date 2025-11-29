import {
  Controller,
  Get,
  Query,
  Res,
  HttpStatus,
  Logger,
  UsePipes,
} from "@nestjs/common";
import { Response } from "express";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { ExportWeatherLogsCsvUseCase } from "src/domain/application/use-cases/export-weather-logs-csv.use-case";
import {
  ExportWeatherLogsQuery,
  exportWeatherLogsQuerySchema,
} from "../schemas/weather-log.schema";

@Controller("api/weather")
export class WeatherExportController {
  private readonly logger = new Logger(WeatherExportController.name);

  constructor(private exportWeatherLogsCsv: ExportWeatherLogsCsvUseCase) {}

  @Get("export/csv")
  @UsePipes(new ZodValidationPipe(exportWeatherLogsQuerySchema))
  async exportCsv(
    @Query() query: ExportWeatherLogsQuery,
    @Res() res: Response
  ) {
    this.logger.log("Iniciando exportação CSV");

    if (query.startDate) {
      this.logger.log(`Filtro startDate: ${query.startDate.toISOString()}`);
    }
    if (query.endDate) {
      this.logger.log(`Filtro endDate: ${query.endDate.toISOString()}`);
    }
    if (query.location) {
      this.logger.log(`Filtro location: ${query.location}`);
    }

    const result = await this.exportWeatherLogsCsv.execute({
      startDate: query.startDate,
      endDate: query.endDate,
      location: query.location,
    });

    if (result.isRight()) {
      const { csv, filename } = result.value;

      this.logger.log(`CSV gerado: ${filename} (${csv.length} bytes)`);

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.status(HttpStatus.OK).send(csv);
    }
  }
}
