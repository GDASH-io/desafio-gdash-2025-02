import { Injectable, BadRequestException} from '@nestjs/common';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from '../schemas/weather.schema';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';

@Injectable()
export class WeatherService {
  constructor(@InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLog>) {}

  async fetchCurrentWeather() {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=-23.55&longitude=-46.63&current_weather=true';
    const { data } = await axios.get(url);

    return {
      temperature: data.current_weather.temperature,
      wind_speed: data.current_weather.windspeed,
      condition: data.current_weather.weathercode,
      time: data.current_weather.time,
    };
  }

  async saveWeatherLog(data: any) {
    const log = new this.weatherModel(data);
    return log.save();
  }

    async createLog(data: any) {
    if (!data?.temperature || !data?.wind_speed || !data?.timestamp) {
      throw new BadRequestException('Campos obrigatórios ausentes.');
    }
    return this.weatherModel.create(data);
  }

  async listLogs() {
    return this.weatherModel.find().sort({ timestamp: -1 }).lean();
  }

  async exportCSV() {
    const rows = await this.listLogs();
    const parser = new Parser({
      fields: [
        'temperature',
        'humidity',
        'wind_speed',
        'condition',
        'rain_probability',
        'timestamp',
      ],
    });
    return parser.parse(rows);
  }

  async exportXLSX() {
    const rows = await this.listLogs();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('weather_logs');

    sheet.columns = [
      { header: 'Temperature', key: 'temperature', width: 15 },
      { header: 'Humidity', key: 'humidity', width: 15 },
      { header: 'Wind Speed', key: 'wind_speed', width: 15 },
      { header: 'Condition', key: 'condition', width: 15 },
      { header: 'Rain Probability', key: 'rain_probability', width: 20 },
      { header: 'Timestamp', key: 'timestamp', width: 25 },
    ];

    sheet.addRows(rows);

    return await workbook.xlsx.writeBuffer();
  }

  async insights() {
    const rows = await this.listLogs();
    const avgTemp = rows.length
      ? rows.reduce((acc, r) => acc + (r.temperature || 0), 0) / rows.length
      : 0;
    return { count: rows.length, avg_temperature: avgTemp };
  }
}
