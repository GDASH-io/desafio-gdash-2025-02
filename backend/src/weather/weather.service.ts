import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';

import { Buffer } from 'buffer';
import * as ExcelJS from 'exceljs';

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

  async generateCsv(): Promise<string> {
    const logs = await this.findAll();

    let csv = 'Data/Hora,Temperatura (C),Umidade (%),Vento (km/h)\n';

    logs.forEach((log) => {
      const date = new Date(log.timestamp).toLocaleString();
      csv += `${date},${log.temperature},${log.humidity},${log.wind_speed}\n`;
    });

    return csv;
  }

  async generateXlsx(): Promise<Buffer> {
    const logs = await this.findAll();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dados Climáticos');

    worksheet.columns = [
      { header: 'Data/Hora', key: 'timestamp', width: 25 },
      { header: 'Temperatura (°C)', key: 'temperature', width: 15 },
      { header: 'Umidade (%)', key: 'humidity', width: 15 },
      { header: 'Vento (km/h)', key: 'wind_speed', width: 15 },
    ];

    logs.forEach((log) => {
      worksheet.addRow({
        timestamp: new Date(log.timestamp).toLocaleString(),
        temperature: log.temperature,
        humidity: log.humidity,
        wind_speed: log.wind_speed,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
