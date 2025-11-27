import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { stringify } from 'csv-stringify';
import * as ExcelJS from 'exceljs';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class WeatherService {
  private readonly OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

  constructor(
    @InjectModel(WeatherLog.name) private weatherLogModel: Model<WeatherLog>,
    private readonly httpService: HttpService,
  ) {}

  async getWeatherForecast(latitude: number, longitude: number): Promise<any> {
    try {
      const params = {
        latitude,
        longitude,
        hourly: 'temperature_2m,apparent_temperature,weathercode,precipitation_probability,relativehumidity_2m,uv_index',
        daily: 'weathercode,temperature_2m_max,temperature_2m_min,uv_index_max',
        current_weather: true,
        timezone: 'auto',
      };

      const response = await firstValueFrom(
        this.httpService.get(this.OPEN_METEO_BASE_URL, { params }),
      );
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch weather forecast from Open-Meteo', error.message);
    }
  }

  async getWeatherHistory(latitude: number, longitude: number, days: number = 7): Promise<any> {
    try {
      // Calcular datas: hoje e X dias atrás
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Formato YYYY-MM-DD
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const params = {
        latitude,
        longitude,
        daily: 'weathercode,temperature_2m_max,temperature_2m_min',
        start_date: startDateStr,
        end_date: endDateStr,
        timezone: 'auto',
      };

      const response = await firstValueFrom(
        this.httpService.get(this.OPEN_METEO_BASE_URL, { params }),
      );
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch weather history from Open-Meteo', error.message);
    }
  }

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
      return "Dados insuficientes para determinar a tendência.";
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
      return "A temperatura está em tendência de alta.";
    } else if (decreasing > increasing) {
      return "A temperatura está em tendência de baixa.";
    } else {
      return "A temperatura está relativamente estável.";
    }
  }

  async exportCsv(): Promise<string> {
    const logs = await this.findAll();
    const columns = [
      'carimbo_de_tempo', 'latitude', 'longitude', 'temperatura', 'velocidade_do_vento', 'codigo_do_clima', 'eh_dia', 'umidade', 'probabilidade_de_precipitacao',
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
      { header: 'Carimbo de Tempo', key: 'timestamp', width: 20 },
      { header: 'Latitude', key: 'latitude', width: 15 },
      { header: 'Longitude', key: 'longitude', width: 15 },
      { header: 'Temperatura', key: 'temperature', width: 15 },
      { header: 'Velocidade do Vento', key: 'windspeed', width: 15 },
      { header: 'Código do Clima', key: 'weathercode', width: 15 },
      { header: 'É Dia', key: 'is_day', width: 10 },
      { header: 'Umidade', key: 'humidity', width: 10 },
      { header: 'Probabilidade de Precipitação', key: 'precipitation_probability', width: 25 },
    ];

    logs.forEach(log => {
      worksheet.addRow(log);
    });

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }
}
