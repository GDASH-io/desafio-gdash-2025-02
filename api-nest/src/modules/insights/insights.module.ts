import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Insight, InsightSchema } from '../../domain/entities/insight.entity';
import { InsightRepositoryImpl } from '../../infra/database/repositories/insight.repository.impl';
import { IInsightRepository } from '../../domain/repositories/insight.repository';
import { SoilingRiskRule } from '../../infra/ai/rules/soiling-risk.rule';
import { ConsecutiveCloudyDaysRule } from '../../infra/ai/rules/consecutive-cloudy-days.rule';
import { HeatDeratingRule } from '../../infra/ai/rules/heat-derating.rule';
import { WindDeratingRule } from '../../infra/ai/rules/wind-derating.rule';
import { StatisticalAnalyzer } from '../../infra/ai/analyzers/statistical-analyzer';
import { TrendAnalyzer } from '../../infra/ai/analyzers/trend-analyzer';
import { DayClassifier } from '../../infra/ai/analyzers/day-classifier';
import { TextGenerator } from '../../infra/ai/generators/text-generator';
import { ComfortScorer } from '../../infra/ai/scorers/comfort-scorer';
import { PVProductionScorer } from '../../infra/ai/scorers/pv-production-scorer';
import { GenerateInsightsUseCase } from '../../application/usecases/insights/generate-insights.use-case';
import { GetInsightsUseCase } from '../../application/usecases/insights/get-insights.use-case';
import { InsightsController } from '../../presentation/controllers/insights.controller';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Insight.name, schema: InsightSchema }]),
    WeatherModule, // Para acessar IWeatherLogRepository
  ],
  controllers: [InsightsController],
  providers: [
    {
      provide: 'IInsightRepository',
      useClass: InsightRepositoryImpl,
    },
    SoilingRiskRule,
    ConsecutiveCloudyDaysRule,
    HeatDeratingRule,
    WindDeratingRule,
    StatisticalAnalyzer,
    TrendAnalyzer,
    DayClassifier,
    TextGenerator,
    ComfortScorer,
    PVProductionScorer,
    GenerateInsightsUseCase,
    GetInsightsUseCase,
  ],
  exports: ['IInsightRepository'],
})
export class InsightsModule {}

