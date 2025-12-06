import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  Logger,
} from "@nestjs/common";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import {
  createWeatherLogSchema,
  CreateWeatherLogInput,
} from "../schemas/weather-log.schema";
import {
  CreateWeatherLogUseCase,
  CreateWeatherLogUseCaseRequest,
} from "src/domain/application/use-cases/create-weather-log.use-case";
import { WeatherLogPresenter } from "../presenters/weather-log.presenter";

@Controller("weather")
export class WeatherIngestController {
  private readonly logger = new Logger(WeatherIngestController.name);

  constructor(private createWeatherLog: CreateWeatherLogUseCase) {}

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
}
