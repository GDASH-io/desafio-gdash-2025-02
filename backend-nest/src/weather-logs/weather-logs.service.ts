import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from './weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';

@Injectable()
export class WeatherLogsService {
  constructor(@InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLogDocument>) {}

  async create(createDto: CreateWeatherLogDto) {
    const created = new this.weatherModel({
      ...createDto,
      received_at: new Date().toISOString(),
    });
    return created.save();
  }

  async findAll() {
    return this.weatherModel.find().sort({ createdAt: -1 }).lean().exec();
  }
}
