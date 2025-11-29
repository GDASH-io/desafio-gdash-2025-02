import { Controller, Get, Query, UsePipes, Logger } from "@nestjs/common";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import {
  listWeatherLogsQuerySchema,
  ListWeatherLogsQuery,
} from "../schemas/weather-log.schema";
import { ListWeatherLogsUseCase } from "src/domain/application/use-cases/list-weather-logs.use-case";
import { WeatherLogPresenter } from "../presenters/weather-log.presenter";

@Controller("api/weather")
export class WeatherQueryController {
  private readonly logger = new Logger(WeatherQueryController.name);

  constructor(private listWeatherLogs: ListWeatherLogsUseCase) {}

  @Get("logs")
  @UsePipes(new ZodValidationPipe(listWeatherLogsQuerySchema))
  async list(@Query() query: ListWeatherLogsQuery) {
    this.logger.log(
      `Consultando logs - Page: ${query.page}, Limit: ${query.limit}`
    );

    const result = await this.listWeatherLogs.execute({
      page: query.page,
      limit: query.limit,
      startDate: query.startDate,
      endDate: query.endDate,
      location: query.location,
    });

    if (result.isRight()) {
      const { logs, pagination } = result.value;

      this.logger.log(
        `Retornando ${logs.length} logs de ${pagination.total} total`
      );

      return {
        data: logs.map(WeatherLogPresenter.toHTTP),
        pagination,
      };
    }
  }
}
