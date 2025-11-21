import { Injectable, Inject } from '@nestjs/common';
import { IInsightRepository } from '../../../domain/repositories/insight.repository';
import { GenerateInsightsUseCase, GenerateInsightsInput } from './generate-insights.use-case';

export interface GetInsightsInput {
  from: Date;
  to: Date;
  types?: string[];
  forceRegenerate?: boolean;
}

@Injectable()
export class GetInsightsUseCase {
  constructor(
    @Inject('IInsightRepository')
    private insightRepository: IInsightRepository,
    private generateInsightsUseCase: GenerateInsightsUseCase,
  ) {}

  async execute(input: GetInsightsInput) {
    const { from, to, types, forceRegenerate = false } = input;

    // Se forçar regeneração, deletar cache e gerar novo
    if (forceRegenerate) {
      await this.insightRepository.deleteByPeriod(from, to);
      return this.generateInsightsUseCase.execute({ from, to, types });
    }

    // Tentar buscar do cache
    const cached = await this.insightRepository.findOne(from, to, types);

    if (cached) {
      return {
        period: { from: cached.period_from, to: cached.period_to },
        pv_metrics: cached.pv_metrics,
        statistics: cached.statistics,
        alerts: cached.alerts,
        summary: cached.summary,
        scores: cached.scores,
        generated_at: cached.generated_at,
      };
    }

    // Se não encontrou no cache, gerar novo
    return this.generateInsightsUseCase.execute({ from, to, types });
  }
}

