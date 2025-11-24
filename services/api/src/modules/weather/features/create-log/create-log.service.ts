import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from '../../schemas/weather-log.schema';
import { CreateWeatherLogDto } from '../../dto/create-weather-log.dto';

@Injectable()
export class CreateLogService {
  constructor(
    @InjectModel(WeatherLog.name) private weatherLogModel: Model<WeatherLog>,
  ) {}

  async create(
    createWeatherLogDto: CreateWeatherLogDto,
    workerId?: string,
  ): Promise<WeatherLog> {
    const weatherLog = new this.weatherLogModel({
      ...createWeatherLogDto,
      timestamp: new Date(createWeatherLogDto.timestamp),
      workerId,
    });

    return weatherLog.save();
  }
}
