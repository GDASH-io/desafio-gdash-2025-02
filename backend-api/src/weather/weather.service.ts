import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WeatherLog,
  WeatherLogDocument,
} from '../weather/schemas/weather-log.schema';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLogDocument>,
  ) {}

  async exportCsv(): Promise<string> {
    const logs = await this.weatherLogModel.find().lean();

    if (!logs.length) {
      return 'No data found';
    }

    const fields = Object.keys(logs[0]);
    const replacer = (key, value) => (value === null ? '' : value);

    const csv = [
      fields.join(','),
      ...logs.map((row) =>
        fields
          .map((fieldsName) => JSON.stringify(row[fieldsName], replacer))
          .join(','),
      ),
    ].join('/n');

    return csv;
  }

  async create(weatherLog: WeatherLog): Promise<WeatherLog> {
    const createdWeatherLog = await this.weatherLogModel.create(weatherLog);
    return createdWeatherLog;
  }

  async findAll(): Promise<WeatherLog[]> {
    return this.weatherLogModel.find().exec();
  }
}
