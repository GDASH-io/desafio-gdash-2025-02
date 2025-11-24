import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Weather, WeatherDocument } from '../weather/schema/weather.schema'

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>
  ) {}

  async getDashboardSummary() {
    const totalRecords = await this.weatherModel.countDocuments()

    const latestRecord = await this.weatherModel
      .findOne()
      .sort({ timestamp: -1 })
      .lean()
      .exec()

    // average metrics (in the structure frontend expects)
    const agg = await this.weatherModel.aggregate([
      {
        $group: {
          _id: null,
          avgTemperature: { $avg: '$data.temperature' },
          avgHumidity: { $avg: '$data.humidity' },
          avgWindSpeed: { $avg: '$data.wind_speed' },
        },
      },
    ])

    const avg = agg[0] || { avgTemperature: 0, avgHumidity: 0, avgWindSpeed: 0 }

    return {
      totalRecords,
      latestRecord,
      avgTemperature: avg.avgTemperature || 0,
      avgHumidity: avg.avgHumidity || 0,
      avgWindSpeed: avg.avgWindSpeed || 0,
    }
  }
}
