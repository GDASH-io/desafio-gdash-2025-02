import {
  Controller,
  Get,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  UsePipes,
  Logger,
} from "@nestjs/common";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { CalculateWeatherStatisticsUseCase } from "src/domain/application/use-cases/calculate-weather-statistics.use-case";
import { DetectWeatherTrendsUseCase } from "src/domain/application/use-cases/detect-weather-trends.use-case";
import { GenerateWeatherAlertsUseCase } from "src/domain/application/use-cases/generate-weather-alerts.use-case";
import { GenerateWeatherSummaryUseCase } from "src/domain/application/use-cases/generate-weather-summary.use-case";
import { CalculateComfortIndexUseCase } from "@/domain/application/use-cases/calculate-comfort-index.use-case";
import {
  AnalyticsQueryParams,
  analyticsQuerySchema,
} from "../schemas/weather-log.schema";
import { ClassifyWeatherDayUseCase } from "@/domain/application/use-cases/classify-weather-day.use-case";

@Controller("weather/analytics")
export class WeatherAnalyticsController {
  private readonly logger = new Logger(WeatherAnalyticsController.name);

  constructor(
    private calculateStatistics: CalculateWeatherStatisticsUseCase,
    private detectTrends: DetectWeatherTrendsUseCase,
    private generateAlerts: GenerateWeatherAlertsUseCase,
    private calculateComfort: CalculateComfortIndexUseCase,
    private generateSummary: GenerateWeatherSummaryUseCase,
    private classifyDay: ClassifyWeatherDayUseCase
  ) {}

  @Get("statistics")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(analyticsQuerySchema))
  async getStatistics(@Query() query: AnalyticsQueryParams) {
    this.logger.log("Calculando estatísticas climáticas...");

    const result = await this.calculateStatistics.execute({
      startDate: query.startDate,
      endDate: query.endDate,
      location: query.location,
    });

    if (result.isRight()) {
      return {
        message: "Statistics calculated successfully",
        data: result.value.statistics,
      };
    }
  }

  @Get("trends")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(analyticsQuerySchema))
  async getTrends(@Query() query: AnalyticsQueryParams) {
    this.logger.log("Detectando tendências climáticas...");

    const result = await this.detectTrends.execute({
      startDate: query.startDate,
      endDate: query.endDate,
      location: query.location,
    });

    if (result.isRight()) {
      return {
        message: "Trends detected successfully",
        data: {
          trends: result.value.trends,
          summary: result.value.summary,
          dataPointsAnalyzed: result.value.dataPointsAnalyzed,
        },
      };
    }
  }

  /**
   * GET /weather/analytics/alerts
   * Gera alertas climáticos
   */
  @Get("alerts")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(analyticsQuerySchema))
  async getAlerts(@Query() query: AnalyticsQueryParams) {
    this.logger.log("Gerando alertas climáticos...");

    const result = await this.generateAlerts.execute({
      startDate: query.startDate,
      endDate: query.endDate,
      location: query.location,
    });

    if (result.isRight()) {
      return {
        message: "Alerts generated successfully",
        data: {
          alerts: result.value.alerts,
          hasActiveAlerts: result.value.hasActiveAlerts,
          generatedAt: result.value.generatedAt,
        },
      };
    }
  }

  @Get("classify/:id")
  @HttpCode(HttpStatus.OK)
  async classifyById(@Param("id") id: string) {
    this.logger.log(`Classificando dia: ${id}`);

    const result = await this.classifyDay.execute({
      weatherLogId: id,
    });

    if (result.isRight()) {
      return {
        message: "Day classified successfully",
        data: result.value.classification,
      };
    }

    return {
      message: "Weather log not found",
    };
  }

  @Get("classify")
  @HttpCode(HttpStatus.OK)
  async classifyLatest() {
    this.logger.log("Classificando dia mais recente...");

    const result = await this.classifyDay.execute({
      latest: true,
    });

    if (result.isRight()) {
      return {
        message: "Day classified successfully",
        data: result.value.classification,
      };
    }

    return {
      message: "No weather data available",
    };
  }

  @Get("comfort/:id")
  @HttpCode(HttpStatus.OK)
  async getComfortById(@Param("id") id: string) {
    this.logger.log(`Calculando conforto para: ${id}`);

    const result = await this.calculateComfort.execute({
      weatherLogId: id,
    });

    if (result.isRight()) {
      return {
        message: "Comfort index calculated successfully",
        data: result.value.comfortIndex,
      };
    }

    return {
      message: "Weather log not found",
    };
  }

  @Get("comfort")
  @HttpCode(HttpStatus.OK)
  async getComfortLatest() {
    this.logger.log("Calculando conforto do dia mais recente...");

    const result = await this.calculateComfort.execute({
      latest: true,
    });

    if (result.isRight()) {
      return {
        message: "Comfort index calculated successfully",
        data: result.value.comfortIndex,
      };
    }

    return {
      message: "No weather data available",
    };
  }

  @Get("summary")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(analyticsQuerySchema))
  async getSummary(@Query() query: AnalyticsQueryParams) {
    this.logger.log("Gerando resumo climático completo...");

    const result = await this.generateSummary.execute({
      startDate: query.startDate,
      endDate: query.endDate,
      location: query.location,
      days: query.days,
    });

    if (result.isRight()) {
      return {
        message: "Summary generated successfully",
        data: result.value,
      };
    }
  }
}
