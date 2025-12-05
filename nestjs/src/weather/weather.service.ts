import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from './weather.schema';

@Injectable()
export class WeatherService {
  constructor(@InjectModel(WeatherLog.name) private model: Model<WeatherLog>) {}

  createLog(data) {
    return this.model.create(data);
  }

  getAll() {
    return this.model.find().sort({ timestamp: -1 });
  }
}
