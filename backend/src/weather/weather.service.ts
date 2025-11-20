import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { FilterWeatherLogsDto } from './dto/filter-weather-logs.dto';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name) private weatherLogModel: Model<WeatherLogDocument>,
  ) {}

  async create(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLog> {
    const weatherLog = new this.weatherLogModel(createWeatherLogDto);
    return weatherLog.save();
  }

  async findAll(filters: FilterWeatherLogsDto) {
    const { city, startDate, endDate, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (city) {
      query.city = new RegExp(city, 'i');
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = startDate;
      }
      if (endDate) {
        query.timestamp.$lte = endDate;
      }
    }

    const [data, total] = await Promise.all([
      this.weatherLogModel.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).exec(),
      this.weatherLogModel.countDocuments(query).exec(),
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
    const query: any = {};
    if (city) {
      query.city = new RegExp(city, 'i');
    }
    return this.weatherLogModel.findOne(query).sort({ timestamp: -1 }).exec();
  }

  async getAggregatedData(timeRange: '24h' | '7d' | '30d', city?: string) {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const query: any = { timestamp: { $gte: startDate } };
    if (city) {
      query.city = new RegExp(city, 'i');
    }

    const logs = await this.weatherLogModel.find(query).exec();

    if (logs.length === 0) {
      return null;
    }

    const avgTemp = logs.reduce((sum, log) => sum + log.temperatureC, 0) / logs.length;
    const avgHumidity = logs.reduce((sum, log) => sum + log.humidity, 0) / logs.length;
    const avgWindSpeed = logs.reduce((sum, log) => sum + log.windSpeedKmh, 0) / logs.length;
    const avgRainProb = logs.reduce((sum, log) => sum + log.rainProbability, 0) / logs.length;

    // Calcular tendência (comparar primeira metade com segunda metade)
    const midPoint = Math.floor(logs.length / 2);
    const firstHalf = logs.slice(0, midPoint);
    const secondHalf = logs.slice(midPoint);

    const firstHalfAvg = firstHalf.reduce((sum, log) => sum + log.temperatureC, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, log) => sum + log.temperatureC, 0) / secondHalf.length;

    const trend = secondHalfAvg > firstHalfAvg ? 'rising' : secondHalfAvg < firstHalfAvg ? 'falling' : 'stable';

    return {
      timeRange,
      city: city || 'all',
      count: logs.length,
      averageTemperature: avgTemp,
      averageHumidity: avgHumidity,
      averageWindSpeed: avgWindSpeed,
      averageRainProbability: avgRainProb,
      trend,
      minTemperature: Math.min(...logs.map((l) => l.temperatureC)),
      maxTemperature: Math.max(...logs.map((l) => l.temperatureC)),
    };
  }
}

