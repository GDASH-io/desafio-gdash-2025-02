import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from '../../../domain/entities/weather-log.entity';
import { IWeatherLogRepository } from '../../../domain/repositories/weather-log.repository';

@Injectable()
export class WeatherLogRepositoryImpl implements IWeatherLogRepository {
  constructor(
    @InjectModel(WeatherLog.name) private weatherLogModel: Model<WeatherLogDocument>,
  ) {}

  async create(log: Partial<WeatherLog>): Promise<WeatherLog> {
    const createdLog = new this.weatherLogModel(log);
    return createdLog.save();
  }

  async createMany(logs: Partial<WeatherLog>[]): Promise<WeatherLog[]> {
    const created = await this.weatherLogModel.insertMany(logs);
    return created as any;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    start?: Date;
    end?: Date;
    city?: string;
    sort?: 'asc' | 'desc';
  }): Promise<{ data: WeatherLog[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;
    const sort = query.sort === 'asc' ? 1 : -1;

    const filter: any = {};
    if (query.start || query.end) {
      filter.timestamp = {};
      if (query.start) filter.timestamp.$gte = query.start;
      if (query.end) filter.timestamp.$lte = query.end;
    }
    if (query.city) {
      filter.city = query.city;
    }

    const [data, total] = await Promise.all([
      this.weatherLogModel
        .find(filter)
        .sort({ timestamp: sort })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.weatherLogModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findLatest(city?: string): Promise<WeatherLog | null> {
    const filter: any = {};
    if (city) {
      filter.city = city;
    }
    return this.weatherLogModel.findOne(filter).sort({ timestamp: -1 }).exec();
  }

  async findForExport(query: {
    start?: Date;
    end?: Date;
    city?: string;
  }): Promise<WeatherLog[]> {
    const filter: any = {};
    if (query.start || query.end) {
      filter.timestamp = {};
      if (query.start) filter.timestamp.$gte = query.start;
      if (query.end) filter.timestamp.$lte = query.end;
    }
    if (query.city) {
      filter.city = query.city;
    }
    return this.weatherLogModel.find(filter).sort({ timestamp: -1 }).exec();
  }
}

