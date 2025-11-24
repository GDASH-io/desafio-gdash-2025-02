import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name)
    private readonly weatherLogModel: Model<WeatherLogDocument>,
  ) {}

  async create(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLog> {
    const { timestamp, ...rest } = createWeatherLogDto;

    const created = new this.weatherLogModel({
      ...rest,
      timestamp: new Date(timestamp),
    });

    return created.save();
  }

  async findAll(page = 1, limit = 50): Promise<{ data: WeatherLog[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.weatherLogModel
        .find()
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.weatherLogModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findAllForExport(): Promise<WeatherLogDocument[]> {
    return this.weatherLogModel.find().sort({ timestamp: 1 }).exec();
  }


  async generateCsv(): Promise<string> {
    const logs = await this.findAllForExport();

    const header = [
      'timestamp',
      'location',
      'temperature',
      'humidity',
      'windSpeed',
      'weatherCondition',
      'rainProbability',
      'source',
    ];

    const lines = logs.map((log) => {
      const obj: any = log.toObject ? log.toObject() : log;

      const values = [
        obj.timestamp instanceof Date ? obj.timestamp.toISOString() : obj.timestamp ?? '',
        obj.location ?? '',
        obj.temperature ?? '',
        obj.humidity ?? '',
        obj.windSpeed ?? '',
        obj.weatherCondition ?? '',
        obj.rainProbability ?? '',
        obj.source ?? '',
      ];

      return values.join(',');
    });

    return [header.join(','), ...lines].join('\n');
  }

  async generateXlsx(): Promise<Buffer> {
    const logs = await this.findAllForExport();

    const data = logs.map((log) => {
      const obj: any = log.toObject ? log.toObject() : log;

      return {
        Timestamp:
          obj.timestamp instanceof Date ? obj.timestamp.toISOString() : obj.timestamp ?? '',
        Location: obj.location ?? '',
        Temperature: obj.temperature ?? '',
        Humidity: obj.humidity ?? '',
        WindSpeed: obj.windSpeed ?? '',
        WeatherCondition: obj.weatherCondition ?? '',
        RainProbability: obj.rainProbability ?? '',
        Source: obj.source ?? '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'WeatherLogs');

    const buffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    });

    return buffer;
  }
}
