import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  Logger,
} from "@nestjs/common";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import {
  createWeatherLogSchema,
  CreateWeatherLogInput,
  listWeatherLogsQuerySchema,
  ListWeatherLogsQuery,
} from "../schemas/weather-log.schema";
import {
  CreateWeatherLogUseCase,
  CreateWeatherLogUseCaseRequest,
} from "src/domain/application/use-cases/create-weather-log.use-case";
import { WeatherLogPresenter } from "../presenters/weather-log.presenter";
import { ListWeatherLogsUseCase } from "src/domain/application/use-cases/list-weather-logs.use-case";

@Controller("weather")
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);

  constructor(
    private createWeatherLog: CreateWeatherLogUseCase,
    private listWeatherLogs: ListWeatherLogsUseCase
  ) {}

  @Post("logs")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createWeatherLogSchema))
  async create(@Body() body: CreateWeatherLogInput) {
    this.logger.log(
      `Recebendo dados: ${body.weather.temperature}°C - ${body.weather.condition} - ${body.location.city}`
    );

    const result = await this.createWeatherLog.execute(
      body as CreateWeatherLogUseCaseRequest
    );

    if (result.isRight()) {
      const { weatherLog } = result.value;

      this.logger.log(`Log criado com sucesso: ${weatherLog.id.toString()}`);

      return {
        message: "Weather log created successfully",
        data: WeatherLogPresenter.toHTTP(weatherLog),
      };
    }
  }

  @Get("logs")
  @UsePipes(new ZodValidationPipe(listWeatherLogsQuerySchema))
  async list(@Query() query: ListWeatherLogsQuery) {
    const result = await this.listWeatherLogs.execute({
      page: query.page,
      limit: query.limit,
      startDate: query.startDate,
      endDate: query.endDate,
      location: query.location,
    });

    if (result.isRight()) {
      const { logs, pagination } = result.value;

      return {
        data: logs.map(WeatherLogPresenter.toHTTP),
        pagination,
      };
    }
  }
}
