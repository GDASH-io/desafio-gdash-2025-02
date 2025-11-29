import {
  Controller,
  Get,
  Post,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  Logger,
} from "@nestjs/common";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { GenerateWeatherInsightsUseCase } from "src/domain/application/use-cases/generate-weather-insights.use-case";
import {
  InsightsQueryParams,
  insightsQuerySchema,
} from "../schemas/weather-log.schema";

@Controller("api/weather/insights")
export class WeatherInsightsController {
  private readonly logger = new Logger(WeatherInsightsController.name);

  constructor(
    private generateWeatherInsights: GenerateWeatherInsightsUseCase
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(insightsQuerySchema))
  async getInsights(@Query() query: InsightsQueryParams) {
    this.logger.log("Gerando insights climáticos...");

    if (query.location) {
      this.logger.log(`Localização: ${query.location}`);
    }
    if (query.startDate) {
      this.logger.log(`Data inicial: ${query.startDate.toISOString()}`);
    }
    if (query.endDate) {
      this.logger.log(`Data final: ${query.endDate.toISOString()}`);
    }

    const result = await this.generateWeatherInsights.execute({
      startDate: query.startDate,
      endDate: query.endDate,
      location: query.location,
      limit: query.limit || 100,
    });

    if (result.isRight()) {
      const { insights, dataPointsAnalyzed } = result.value;

      this.logger.log(
        `Insights gerados com sucesso (${dataPointsAnalyzed} pontos analisados)`
      );

      return {
        message: "Insights generated successfully",
        data: insights,
        metadata: {
          dataPointsAnalyzed,
          generatedAt: insights.generatedAt,
        },
      };
    }
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(insightsQuerySchema))
  async generateInsights(@Query() query: InsightsQueryParams) {
    return this.getInsights(query);
  }
}
