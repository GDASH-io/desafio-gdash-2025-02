import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather, WeatherDocument } from '../weather/schema/weather.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Weather.name)
    private readonly weatherModel: Model<WeatherDocument>,
  ) {}

  async getAnalytics() {
    const total = await this.weatherModel.countDocuments();

    const avgTemp = await this.weatherModel.aggregate([
      { $group: { _id: null, avg: { $avg: "$data.temperature" } } }
    ]);

    return {
      totalRecords: total,
      averageTemperature: avgTemp[0]?.avg || 0,
    };
  }
}
