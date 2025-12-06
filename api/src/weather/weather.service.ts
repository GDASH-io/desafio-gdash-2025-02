import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLogDocument>,
  ) {}

  async create(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLog> {
    const logTimestamp = new Date(createWeatherLogDto.timestamp);
    const thirtyMinutesBefore = new Date(logTimestamp.getTime() - 30 * 60000);
    const thirtyMinutesAfter = new Date(logTimestamp.getTime() + 30 * 60000);

    const existingLog = await this.weatherLogModel
      .findOne({
        timestamp: {
          $gte: thirtyMinutesBefore.toISOString(),
          $lte: thirtyMinutesAfter.toISOString(),
        },
      })
      .exec();

    if (existingLog) {
      return existingLog;
    }

    const createdLog = new this.weatherLogModel(createWeatherLogDto);
    return createdLog.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 50,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    data: WeatherLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query: any = {};

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = startDate;
      }
      if (endDate) {
        query.timestamp.$lte = endDate;
      }
    }

    const skip = (page - 1) * limit;

    const sortOrder = startDate || endDate ? 1 : -1;

    const [data, total] = await Promise.all([
      this.weatherLogModel
        .find(query)
        .sort({ timestamp: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.weatherLogModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<WeatherLog> {
    return this.weatherLogModel.findById(id).exec();
  }

  async exportToCSV(startDate?: string, endDate?: string): Promise<string> {
    const query: any = {};

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = startDate;
      }
      if (endDate) {
        query.timestamp.$lte = endDate;
      }
    }

    const logs = await this.weatherLogModel
      .find(query)
      .sort({ timestamp: -1 })
      .exec();

    const headers = [
      'Timestamp',
      'Latitude',
      'Longitude',
      'Temperature (°C)',
      'Humidity (%)',
      'Wind Speed (km/h)',
      'Weather Code',
    ];

    const rows = logs.map((log) => [
      log.timestamp,
      log.location.latitude,
      log.location.longitude,
      log.current.temperature,
      log.current.humidity,
      log.current.wind_speed,
      log.current.weather_code,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  async exportToXLSX(startDate?: string, endDate?: string): Promise<Buffer> {
    const query: any = {};

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = startDate;
      }
      if (endDate) {
        query.timestamp.$lte = endDate;
      }
    }

    const logs = await this.weatherLogModel
      .find(query)
      .sort({ timestamp: -1 })
      .exec();

    const data = logs.map((log) => ({
      Timestamp: log.timestamp,
      Latitude: log.location.latitude,
      Longitude: log.location.longitude,
      'Temperature (°C)': log.current.temperature,
      'Humidity (%)': log.current.humidity,
      'Wind Speed (km/h)': log.current.wind_speed,
      'Weather Code': log.current.weather_code,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Weather Logs');

    return Buffer.from(
      XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }),
    );
  }

  async getStatistics(): Promise<any> {
    const logs = await this.weatherLogModel
      .find()
      .sort({ timestamp: -1 })
      .limit(100)
      .exec();

    if (logs.length === 0) {
      return {
        averageTemperature: 0,
        averageHumidity: 0,
        averageWindSpeed: 0,
        totalRecords: 0,
      };
    }

    const temperatures = logs.map((log) => log.current.temperature);
    const humidities = logs.map((log) => log.current.humidity);
    const windSpeeds = logs.map((log) => log.current.wind_speed);

    return {
      averageTemperature:
        temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
      averageHumidity:
        humidities.reduce((a, b) => a + b, 0) / humidities.length,
      averageWindSpeed:
        windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length,
      totalRecords: logs.length,
      minTemperature: Math.min(...temperatures),
      maxTemperature: Math.max(...temperatures),
    };
  }
}
