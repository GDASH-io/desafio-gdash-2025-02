import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  Logger,
} from "@nestjs/common";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { CalculateWeatherStatisticsUseCase } from "src/domain/application/use-cases/calculate-weather-statistics.use-case";
import { DetectWeatherTrendsUseCase } from "src/domain/application/use-cases/detect-weather-trends.use-case";
import { GenerateWeatherAlertsUseCase } from "src/domain/application/use-cases/generate-weather-alerts.use-case";
import { ListWeatherLogsUseCase } from "src/domain/application/use-cases/list-weather-logs.use-case";
import { WeatherLogPresenter } from "../presenters/weather-log.presenter";
import { CalculateComfortIndexUseCase } from "@/domain/application/use-cases/calculate-comfort-index.use-case";
import { ClassifyWeatherDayUseCase } from "@/domain/application/use-cases/classify-weather-day.use-case";
import {
  DashboardQueryParams,
  dashboardQuerySchema,
} from "../schemas/weather-log.schema";

@Controller("api/weather/dashboard")
export class WeatherDashboardController {
  private readonly logger = new Logger(WeatherDashboardController.name);

  constructor(
    private calculateStatistics: CalculateWeatherStatisticsUseCase,
    private detectTrends: DetectWeatherTrendsUseCase,
    private generateAlerts: GenerateWeatherAlertsUseCase,
    private calculateComfort: CalculateComfortIndexUseCase,
    private classifyDay: ClassifyWeatherDayUseCase,
    private listWeatherLogs: ListWeatherLogsUseCase
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(dashboardQuerySchema))
  async getDashboard(@Query() query: DashboardQueryParams) {
    this.logger.log("Gerando dashboard completo...");

    try {
      const [
        logsResult,
        statisticsResult,
        trendsResult,
        alertsResult,
        comfortResult,
        classificationResult,
      ] = await Promise.all([
        this.listWeatherLogs.execute({
          page: 1,
          limit: query.recentLogsLimit || 10,
          startDate: query.startDate,
          endDate: query.endDate,
          location: query.location,
        }),

        this.calculateStatistics.execute({
          startDate: query.startDate,
          endDate: query.endDate,
          location: query.location,
        }),

        this.detectTrends.execute({
          startDate: query.startDate,
          endDate: query.endDate,
          location: query.location,
        }),

        this.generateAlerts.execute({
          startDate: query.startDate,
          endDate: query.endDate,
          location: query.location,
        }),

        this.calculateComfort.execute({
          latest: true,
        }),

        this.classifyDay.execute({
          latest: true,
        }),
      ]);

      const dashboard: any = {
        generatedAt: new Date(),
        location: query.location || "Todas as localizações",
        period: {
          start: query.startDate || null,
          end: query.endDate || null,
        },
      };

      if (logsResult.isRight()) {
        dashboard.recentLogs = {
          data: logsResult.value.logs.map(WeatherLogPresenter.toHTTP),
          pagination: logsResult.value.pagination,
        };
      }

      if (statisticsResult.isRight()) {
        dashboard.statistics = statisticsResult.value.statistics;
      }

      if (trendsResult.isRight()) {
        dashboard.trends = {
          trends: trendsResult.value.trends,
          summary: trendsResult.value.summary,
        };
      }

      if (alertsResult.isRight()) {
        dashboard.alerts = {
          active: alertsResult.value.alerts,
          hasActiveAlerts: alertsResult.value.hasActiveAlerts,
        };
      }

      if (comfortResult.isRight()) {
        dashboard.comfort = comfortResult.value.comfortIndex;
      }

      if (classificationResult.isRight()) {
        dashboard.currentDay = {
          classification: classificationResult.value.classification,
        };
      }

      return {
        message: "Dashboard generated successfully",
        data: dashboard,
      };
    } catch (error) {
      this.logger.error("Erro ao gerar dashboard:", error);

      return {
        message: "Error generating dashboard",
        error: error.message,
      };
    }
  }
}
