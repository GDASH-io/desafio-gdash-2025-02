import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from '../../schemas/weather-log.schema';
import { FindWeatherLogsDto } from '../../dto/find-weather-logs.dto';

@Injectable()
export class FindLogsService {
  constructor(
    @InjectModel(WeatherLog.name) private weatherLogModel: Model<WeatherLog>,
  ) {}

  async findAll(filters: FindWeatherLogsDto) {
    const { city, state, startDate, endDate, limit = '50', offset = '0' } = filters;

    const query: Record<string, unknown> = {};

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (state) {
      query.state = { $regex: state, $options: 'i' };
    }

    if (startDate || endDate) {
      const timestampQuery: Record<string, Date> = {};
      if (startDate) {
        timestampQuery.$gte = new Date(startDate);
      }
      if (endDate) {
        timestampQuery.$lte = new Date(endDate);
      }
      query.timestamp = timestampQuery;
    }

    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);

    const [logs, total] = await Promise.all([
      this.weatherLogModel
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limitNum)
        .skip(offsetNum)
        .exec(),
      this.weatherLogModel.countDocuments(query).exec(),
    ]);

    return {
      data: logs,
      meta: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total,
      },
    };
  }

  async findLatest(city?: string) {
    const query = city ? { city: { $regex: city, $options: 'i' } } : {};

    return this.weatherLogModel
      .findOne(query)
      .sort({ timestamp: -1 })
      .exec();
  }

  async getStats(city?: string, startDate?: string, endDate?: string) {
    const matchStage: Record<string, unknown> = {};

    if (city) {
      matchStage.city = { $regex: city, $options: 'i' };
    }

    if (startDate || endDate) {
      const timestampQuery: Record<string, Date> = {};
      if (startDate) {
        timestampQuery.$gte = new Date(startDate);
      }
      if (endDate) {
        timestampQuery.$lte = new Date(endDate);
      }
      matchStage.timestamp = timestampQuery;
    }

    const stats = await this.weatherLogModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          avgTemperature: { $avg: '$temperature' },
          minTemperature: { $min: '$temperature' },
          maxTemperature: { $max: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          avgWindSpeed: { $avg: '$windSpeed' },
          totalRecords: { $sum: 1 },
        },
      },
    ]);

    return stats[0] || null;
  }
}
