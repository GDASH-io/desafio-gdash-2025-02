import { Insight } from '../entities/insight.entity';

export interface IInsightRepository {
  findOne(periodFrom: Date, periodTo: Date, types?: string[]): Promise<Insight | null>;
  create(insight: Partial<Insight>): Promise<Insight>;
  deleteExpired(): Promise<void>;
  deleteByPeriod(periodFrom: Date, periodTo: Date): Promise<void>;
}

