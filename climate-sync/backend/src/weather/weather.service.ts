import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Weather } from './schema/weather.schema';
import { Model } from 'mongoose';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(Weather.name) private model: Model<Weather>,
  ) {}

  async saveWeather(payload: any) {
    return this.model.create(payload);
  }

  async getLatest() {
    return this.model.findOne().sort({ createdAt: -1 });
  }

  async getAll() {
    return this.model.find().sort({ createdAt: -1 });
  }
}
