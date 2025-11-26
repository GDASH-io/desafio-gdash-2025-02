import { Injectable, Inject } from '@nestjs/common';
import { IWeatherLogRepository } from '../../../domain/repositories/weather-log.repository';
import { IInsightRepository } from '../../../domain/repositories/insight.repository';
import { SoilingRiskRule } from '../../../infra/ai/rules/soiling-risk.rule';
import { ConsecutiveCloudyDaysRule } from '../../../infra/ai/rules/consecutive-cloudy-days.rule';
import { HeatDeratingRule } from '../../../infra/ai/rules/heat-derating.rule';
import { WindDeratingRule } from '../../../infra/ai/rules/wind-derating.rule';
import { StatisticalAnalyzer } from '../../../infra/ai/analyzers/statistical-analyzer';
import { TrendAnalyzer } from '../../../infra/ai/analyzers/trend-analyzer';
import { DayClassifier } from '../../../infra/ai/analyzers/day-classifier';
import { TextGenerator } from '../../../infra/ai/generators/text-generator';
import { ComfortScorer } from '../../../infra/ai/scorers/comfort-scorer';
import { PVProductionScorer } from '../../../infra/ai/scorers/pv-production-scorer';

export interface GenerateInsightsInput {
  from: Date;
  to: Date;
  types?: string[];
}

export interface GenerateInsightsOutput {
  period: { from: Date; to: Date };
  pv_metrics: any;
  statistics: any;
  alerts: any[];
  summary: string;
  scores: any;
  generated_at: Date;
}

@Injectable()
export class GenerateInsightsUseCase {
  constructor(
    @Inject('IWeatherLogRepository')
    private weatherLogRepository: IWeatherLogRepository,
    @Inject('IInsightRepository')
    private insightRepository: IInsightRepository,
    private soilingRiskRule: SoilingRiskRule,
    private consecutiveCloudyDaysRule: ConsecutiveCloudyDaysRule,
    private heatDeratingRule: HeatDeratingRule,
    private windDeratingRule: WindDeratingRule,
    private statisticalAnalyzer: StatisticalAnalyzer,
    private trendAnalyzer: TrendAnalyzer,
    private dayClassifier: DayClassifier,
    private textGenerator: TextGenerator,
    private comfortScorer: ComfortScorer,
    private pvProductionScorer: PVProductionScorer,
  ) {}

  async execute(input: GenerateInsightsInput): Promise<GenerateInsightsOutput> {
    const { from, to, types = [] } = input;

    // Buscar logs do período
    const logs = await this.weatherLogRepository.findForExport({
      start: from,
      end: to,
    });

    if (logs.length === 0) {
      throw new Error('Não há dados para o período especificado');
    }

    // Calcular estatísticas
    const statistics = this.statisticalAnalyzer.analyze(logs);
    const tempTrend = this.trendAnalyzer.analyze(logs, 'temperature_c');
    const dayClassification = this.dayClassifier.classify(logs);

    // Calcular métricas PV
    const soilingRisk = this.soilingRiskRule.calculate(logs);
    const cloudyDays = this.consecutiveCloudyDaysRule.calculate(logs);
    const heatDerating = this.heatDeratingRule.calculate(logs);
    const windDerating = this.windDeratingRule.calculate(logs);

    // Calcular produção estimada
    const avgIrradiance =
      logs
        .map((log) => log.estimated_irradiance_w_m2 || 0)
        .reduce((a, b) => a + b, 0) / logs.length;

    const totalPrecipitation = logs.reduce(
      (sum, log) => sum + (log.precipitation_mm || 0),
      0,
    );

    const pvScore = this.pvProductionScorer.calculate({
      avg_irradiance: avgIrradiance,
      avg_temp: statistics.avg_temp,
      avg_clouds: logs.reduce((sum, log) => sum + (log.clouds_percent || 0), 0) / logs.length,
      soiling_risk_score: soilingRisk.score,
    });

    // Calcular produção estimada em %
    const estimatedProductionPct = Math.max(
      0,
      100 -
        cloudyDays.estimated_reduction_pct -
        heatDerating.derating_pct -
        (soilingRisk.score / 10) -
        (windDerating.risk_level === 'high' ? 10 : windDerating.risk_level === 'medium' ? 5 : 0),
    );

    // Gerar alertas
    const alerts = this.textGenerator.generateAlerts({
      logs: logs.map((log) => ({
        temperature_c: log.temperature_c,
        precipitation_mm: log.precipitation_mm,
        wind_speed_m_s: log.wind_speed_m_s,
        clouds_percent: log.clouds_percent,
        timestamp: log.timestamp,
      })),
    });

    // Gerar resumo
    const summary = this.textGenerator.generateSummary({
      period: { from, to },
      statistics: {
        ...statistics,
        trend: tempTrend.trend,
        classification: dayClassification.classification,
      },
      pv_metrics: {
        estimated_production_pct: estimatedProductionPct,
        soiling_risk: soilingRisk,
        consecutive_cloudy_days: cloudyDays,
        heat_derating: heatDerating,
      },
    });

    // Calcular scores
    const comfortScore = this.comfortScorer.calculate({
      avg_temp: statistics.avg_temp,
      avg_humidity: statistics.avg_humidity,
      total_precipitation: totalPrecipitation,
    });

    // Montar resposta
    const insights: GenerateInsightsOutput = {
      period: { from, to },
      pv_metrics: {
        soiling_risk: soilingRisk,
        consecutive_cloudy_days: cloudyDays,
        heat_derating: heatDerating,
        wind_derating: windDerating,
        estimated_production_pct: Math.round(estimatedProductionPct * 10) / 10,
        estimated_production_kwh: pvScore.estimated_production_kwh,
      },
      statistics: {
        ...statistics,
        trend: tempTrend.trend,
        slope: tempTrend.slope,
        classification: dayClassification.classification,
      },
      alerts,
      summary,
      scores: {
        comfort_score: comfortScore.comfort_score,
        pv_production_score: pvScore.pv_production_score,
      },
      generated_at: new Date(),
    };

    // Salvar em cache
    await this.insightRepository.create({
      period_from: from,
      period_to: to,
      types,
      ...insights,
      expires_at: new Date(Date.now() + 3600 * 1000), // 1 hora
    });

    return insights;
  }
}

