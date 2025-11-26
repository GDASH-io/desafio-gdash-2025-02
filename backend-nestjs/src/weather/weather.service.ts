import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Weather, WeatherDocument } from './entities/weather.schema';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>,
  ) {}

  async create(data: any): Promise<Weather> {
    try {
      const createdWeather = new this.weatherModel(data);
      return await createdWeather.save();
    } catch (error) {
      this.logger.error('Failed to save weather data', error);
      throw error;
    }
  }

  async findAll(limit?: number, start?: string, end?: string): Promise<Weather[]> {
    const query: FilterQuery<WeatherDocument> = {};

    if (start && end) {
      query.collected_at = { 
        $gte: start, 
        $lte: end 
      };
    }

    const dbQuery = this.weatherModel.find(query).sort({ collected_at: -1 });

    if (limit && limit > 0) {
      dbQuery.limit(limit);
    }

    return dbQuery.exec();
  }
}