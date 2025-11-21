import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Insight, InsightDocument } from '../../../domain/entities/insight.entity';
import { IInsightRepository } from '../../../domain/repositories/insight.repository';

@Injectable()
export class InsightRepositoryImpl implements IInsightRepository {
  constructor(
    @InjectModel(Insight.name) private insightModel: Model<InsightDocument>,
  ) {}

  async findOne(periodFrom: Date, periodTo: Date, types?: string[]): Promise<Insight | null> {
    const query: any = {
      period_from: periodFrom,
      period_to: periodTo,
    };

    if (types && types.length > 0) {
      query.types = { $all: types };
    }

    return this.insightModel.findOne(query).exec();
  }

  async create(insight: Partial<Insight>): Promise<Insight> {
    const created = new this.insightModel(insight);
    return created.save();
  }

  async deleteExpired(): Promise<void> {
    await this.insightModel.deleteMany({
      expires_at: { $lt: new Date() },
    }).exec();
  }

  async deleteByPeriod(periodFrom: Date, periodTo: Date): Promise<void> {
    await this.insightModel.deleteMany({
      period_from: periodFrom,
      period_to: periodTo,
    }).exec();
  }
}

