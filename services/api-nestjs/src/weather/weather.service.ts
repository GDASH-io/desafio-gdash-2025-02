import { Injectable } from '@nestjs/common';
import { logsWeatherDTO } from '../DTO/logsWeather.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WeatherLogs } from 'src/schema/weather.schema';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel('WeatherLogs')
    private weatherLogsModel: Model<WeatherLogs>,
  ) { }

  async logWeatherPost(logsWeather: logsWeatherDTO): Promise<WeatherLogs> {
    const createdLog = new this.weatherLogsModel(logsWeather);
    return createdLog.save();
  }

  async logWeatherGet(): Promise<WeatherLogs[]> {
    return this.weatherLogsModel.find().exec();
  }

  async logWeatherGetById(id: string): Promise<WeatherLogs | null> {
    return this.weatherLogsModel.findOne({ id_log: id }).exec();
  }

  async updateLogWeather(
    id: string,
    updateData: Partial<logsWeatherDTO>,
  ): Promise<WeatherLogs | null> {
    return this.weatherLogsModel
      .findOneAndUpdate({ id_log: id }, updateData, { new: true })
      .exec();
  }

  async deleteLogWeather(id: string): Promise<WeatherLogs | null> {
    return this.weatherLogsModel.findOneAndDelete({ id_log: id }).exec();
  }
}
