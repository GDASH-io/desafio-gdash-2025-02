import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  WeatherLogSchema,
  WeatherLogDocument,
} from "../schemas/weather-log.schema";
import { WeatherLogMapper } from "../mappers/weather-log-mapper";
import {
  FindManyParams,
  PaginationResult,
  WeatherLogRepository,
} from "src/domain/application/repositories/weather-log-repository";
import { WeatherLog } from "src/domain/enterprise/entities/weather-log";

@Injectable()
export class MongoDBWeatherLogRepository implements WeatherLogRepository {
  constructor(
    @InjectModel(WeatherLogSchema.name)
    private weatherLogModel: Model<WeatherLogDocument>
  ) {}

  async create(weatherLog: WeatherLog): Promise<void> {
    const raw = WeatherLogMapper.toPersistence(weatherLog);
    await this.weatherLogModel.create(raw);
  }

  async findById(id: string): Promise<WeatherLog | null> {
    const weatherLog = await this.weatherLogModel.findById(id).exec();

    if (!weatherLog) {
      return null;
    }

    return WeatherLogMapper.toDomain(weatherLog);
  }

  async findMany(
    params?: FindManyParams
  ): Promise<PaginationResult<WeatherLog>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (params?.location) {
      filter.location = { $regex: params.location, $options: "i" };
    }

    if (params?.startDate || params?.endDate) {
      filter.collectedAt = {};
      if (params.startDate) {
        filter.collectedAt.$gte = params.startDate;
      }
      if (params.endDate) {
        filter.collectedAt.$lte = params.endDate;
      }
    }

    const [data, total] = await Promise.all([
      this.weatherLogModel
        .find(filter)
        .sort({ collectedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.weatherLogModel.countDocuments(filter).exec(),
    ]);

    return {
      data: data.map(WeatherLogMapper.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findRecent(limit: number): Promise<WeatherLog[]> {
    const logs = await this.weatherLogModel
      .find()
      .sort({ collectedAt: -1 })
      .limit(limit)
      .exec();

    return logs.map(WeatherLogMapper.toDomain);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<WeatherLog[]> {
    const logs = await this.weatherLogModel
      .find({
        collectedAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ collectedAt: -1 })
      .exec();

    return logs.map(WeatherLogMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.weatherLogModel.findByIdAndDelete(id).exec();
  }
}
