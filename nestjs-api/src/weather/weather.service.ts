import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { stringify } from 'csv-stringify';
import * as ExcelJS from 'exceljs';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name) private weatherLogModel: Model<WeatherLog>,
  ) {}

  async create(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLog> {
    const createdWeatherLog = new this.weatherLogModel(createWeatherLogDto);
    return createdWeatherLog.save();
  }

  async findAll(): Promise<WeatherLog[]> {
    return this.weatherLogModel.find().exec();
  }

  async getAverageTemperature(): Promise<number> {
    const result = await this.weatherLogModel.aggregate([
      { $group: { _id: null, averageTemperature: { $avg: '$temperature' } } },
    ]).exec();

    if (result.length > 0) {
      return result[0].averageTemperature;
    }
    return 0; 
  }

  async getTemperatureTrend(): Promise<string> {
    const latestLogs = await this.weatherLogModel.find()
      .sort({ timestamp: -1 })
      .limit(5) 
      .exec();

    if (latestLogs.length < 2) {
      return "Not enough data to determine trend.";
    }

    let increasing = 0;
    let decreasing = 0;
    for (let i = 0; i < latestLogs.length - 1; i++) {
      if (latestLogs[i].temperature > latestLogs[i+1].temperature) {
        increasing++;
      } else if (latestLogs[i].temperature < latestLogs[i+1].temperature) {
        decreasing++;
      }
    }

    if (increasing > decreasing) {
      return "Temperature is trending upwards.";
    } else if (decreasing > increasing) {
      return "Temperature is trending downwards.";
    } else {
      return "Temperature is relatively stable.";
    }
  }

  async exportCsv(): Promise<string> {
    const logs = await this.findAll();
    const columns = [
      'timestamp', 'latitude', 'longitude', 'temperature', 'windspeed', 'weathercode', 'is_day', 'humidity', 'precipitation_probability',
    ];
    const data = logs.map(log => columns.map(col => log[col]));

    return new Promise((resolve, reject) => {
      stringify(data, { header: true, columns: columns }, (err, output) => {
        if (err) return reject(err);
        resolve(output);
      });
    });
  }

  async exportXlsx(): Promise<Buffer> {
    const logs = await this.findAll();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Weather Logs');

    worksheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 20 },
      { header: 'Latitude', key: 'latitude', width: 15 },
      { header: 'Longitude', key: 'longitude', width: 15 },
      { header: 'Temperature', key: 'temperature', width: 15 },
      { header: 'Windspeed', key: 'windspeed', width: 15 },
      { header: 'Weather Code', key: 'weathercode', width: 15 },
      { header: 'Is Day', key: 'is_day', width: 10 },
      { header: 'Humidity', key: 'humidity', width: 10 },
      { header: 'Precipitation Probability', key: 'precipitation_probability', width: 25 },
    ];

    logs.forEach(log => {
      worksheet.addRow(log);
    });

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }
}
