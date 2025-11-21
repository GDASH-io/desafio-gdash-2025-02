import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherModel: Model<WeatherLogDocument>,
  ) {}

  async create(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLog> {
    const createdLog = new this.weatherModel(createWeatherLogDto);
    return createdLog.save();
  }

  async findAll(): Promise<WeatherLog[]> {
    return this.weatherModel.find().sort({ createdAt: -1 }).exec();
  }
}
