import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather, WeatherDocument } from './schemas/weather.schema';
import { Parser } from 'json2csv';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>,
  ) {}

  async create(data: Partial<Weather>): Promise<Weather> {
    const created = new this.weatherModel(data);
    return created.save();
  }

  async findAll(): Promise<Weather[]> {
    return this.weatherModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Weather | null> {
    return this.weatherModel.findById(id).exec();
  }

  async findByFilter(filter: {
    city?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Weather[]> {
    const query: any = {};

    if (filter.city) query.city = filter.city;

    if (filter.startDate || filter.endDate) {
      query.createdAt = {};
      if (filter.startDate) query.createdAt.$gte = new Date(filter.startDate);
      if (filter.endDate) query.createdAt.$lte = new Date(filter.endDate);
    }

    return this.weatherModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async getInsights() {
    const logs = await this.weatherModel.find();
    if (!logs.length) return { message: 'No data available' };

    const avgTemp =
      logs.reduce((sum, log) => sum + log.temperature, 0) / logs.length;

    const avgHum =
      logs.reduce((sum, log) => sum + log.humidity, 0) / logs.length;

    return { averageTemperature: avgTemp, averageHumidity: avgHum };
  }

  async exportsCsv(): Promise<string> {
    const logs = await this.weatherModel.find();
    const parser = new Parser();
    const csv = parser.parse(logs);

    return csv;
  }
}
