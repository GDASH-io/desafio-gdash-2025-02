import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class WeatherPaginationService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLogDocument>,
  ) {}

  async paginate(pagination: PaginationDto) {
    const { page, limit } = pagination;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.weatherLogModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      this.weatherLogModel.countDocuments(),
    ]);

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
