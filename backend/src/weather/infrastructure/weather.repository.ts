import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from '../schemas/weather-log.schema';
import { IWeatherRepository } from '../domain/weather.repository.interface';
import { WeatherEntity } from '../domain/weather.entity';

@Injectable()
export class WeatherRepository implements IWeatherRepository {
  constructor(@InjectModel(WeatherLog.name) private weatherLogModel: Model<WeatherLogDocument>) {}

  private toEntity(doc: WeatherLogDocument): WeatherEntity {
    return new WeatherEntity(
      doc.city,
      doc.temperature,
      doc.humidity,
      doc.windSpeed,
      doc.condition,
      doc.timestamp,
      doc._id.toString(),
    );
  }

  async create(weather: WeatherEntity): Promise<WeatherEntity> {
    const createdLog = new this.weatherLogModel({
      city: weather.city,
      temperature: weather.temperature,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      condition: weather.condition,
      timestamp: weather.timestamp,
    });
    const saved = await createdLog.save();
    return this.toEntity(saved);
  }

  async findAll(): Promise<WeatherEntity[]> {
    const logs = await this.weatherLogModel.find().sort({ timestamp: -1 }).exec();
    return logs.map(log => this.toEntity(log));
  }
}
