import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { WeatherLogRepository } from "../../infrastructure/repositories/weather-log.repository";
import { AIInsightsService } from "../../infrastructure/services/ai-insights.service";
import { InsightsFiltersDto } from "@/common/dto/weather-log.dto";

@Injectable()
export class GenerateInsightsUseCase {
    private readonly logger = new Logger(GenerateInsightsUseCase.name);

    constructor(
        private readonly weatherLogRepository: WeatherLogRepository,
        private readonly aiInsightsService: AIInsightsService,
    ) { }

    async execute(filters: InsightsFiltersDto) {
        const { city, period, startDate, endDate } = filters;

        const dateRange = this.calculateDateRange(period, startDate, endDate)

        const statistics = await this.weatherLogRepository.getStatistics({
            city,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
        });

        if (statistics.totalRecords === 0) {
            throw new NotFoundException(
                'Nenhum dado climático encontrado para os filtros especificados',
            );
        }

        const recentData = await this.weatherLogRepository.findRecent({
            city,
            hours: this.getHoursFromPeriod(period),
            limit: 50,
        });

        const insights = await this.aiInsightsService.generateInsights(
            city || 'região',
            statistics,
            recentData,
        );

        this.logger.log(`Generated insights for ${city || 'all cities'} - ${period}`)

        return {
            filters: {
                city,
                period,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
            },
            statistics,
            insights,
        };
    }

    private calculateDateRange(
        period?: string,
        startDate?: string,
        endDate?: string,
    ): { startDate: Date; endDate: Date } {
        const end = endDate ? new Date(endDate) : new Date();

        let start: Date;

        if (startDate) {
            start = new Date();
        } else {
            start = new Date();
            switch (period) {
                case '24h':
                    start.setHours(start.getHours() - 24);
                    break;
                case '7d':
                    start.setDate(start.getDate() - 7);
                    break;
                case '30d':
                    start.setDate(start.getDate() - 30);
                    break;
                default:
                    start.setDate(start.getDate() - 7);
            }
        }

        return { startDate: start, endDate: end };
    }

    private getHoursFromPeriod(period?: string): number {
        switch (period) {
            case '24h':
                return 24;
            case '7d':
                return 168;
            case '30d':
                return 720;
            default:
                return 168;
        }
    }
}