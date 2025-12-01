import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from './schema/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import * as csvWriter from 'csv-writer';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLog>,
  ) {}

  async create(dto: CreateWeatherLogDto): Promise<WeatherLog> {
    const weatherLog = new this.weatherModel(dto);
    return weatherLog.save();
  }

  async findAll(page = 1, limit = 50): Promise<{ data: WeatherLog[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.weatherModel
        .find()
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.weatherModel.countDocuments(),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<WeatherLog | null> {
    return this.weatherModel.findById(id).exec();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<WeatherLog[]> {
    return this.weatherModel
      .find({
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ timestamp: -1 })
      .exec();
  }

  async getLatest(limit = 10): Promise<WeatherLog[]> {
    return this.weatherModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async getStats() {
    const logs = await this.weatherModel.find().exec();

    if (logs.length === 0) {
      return null;
    }

    const temperatures = logs.map(log => log.temperature);
    const humidities = logs.map(log => log.humidity);
    const windSpeeds = logs.map(log => log.windSpeed);

    return {
      totalRecords: logs.length,
      temperature: {
        avg: this.average(temperatures),
        min: Math.min(...temperatures),
        max: Math.max(...temperatures),
      },
      humidity: {
        avg: this.average(humidities),
        min: Math.min(...humidities),
        max: Math.max(...humidities),
      },
      windSpeed: {
        avg: this.average(windSpeeds),
        min: Math.min(...windSpeeds),
        max: Math.max(...windSpeeds),
      },
    };
  }

  async exportToCsv(): Promise<string> {
    const logs = await this.weatherModel.find().sort({ timestamp: -1 }).exec();
    
    const outputPath = path.join(process.cwd(), 'exports', `weather-${Date.now()}.csv`);
    
    // Criar pasta exports se não existir
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const writer = csvWriter.createObjectCsvWriter({
      path: outputPath,
      header: [
        { id: 'timestamp', title: 'Data/Hora' },
        { id: 'location', title: 'Local' },
        { id: 'temperature', title: 'Temperatura (°C)' },
        { id: 'humidity', title: 'Umidade (%)' },
        { id: 'windSpeed', title: 'Vento (km/h)' },
        { id: 'condition', title: 'Condição' },
        { id: 'rainProbability', title: 'Prob. Chuva (%)' },
      ],
    });

    const records = logs.map(log => ({
      timestamp: log.timestamp.toISOString(),
      location: log.location.name,
      temperature: log.temperature,
      humidity: log.humidity,
      windSpeed: log.windSpeed,
      condition: log.condition,
      rainProbability: log.rainProbability || 0,
    }));

    await writer.writeRecords(records);
    
    return outputPath;
  }

  async exportToXlsx(): Promise<string> {
    const logs = await this.weatherModel.find().sort({ timestamp: -1 }).exec();
    
    const data = logs.map(log => ({
      'Data/Hora': log.timestamp.toISOString(),
      'Local': log.location.name,
      'Temperatura (°C)': log.temperature,
      'Umidade (%)': log.humidity,
      'Vento (km/h)': log.windSpeed,
      'Condição': log.condition,
      'Prob. Chuva (%)': log.rainProbability || 0,
      'Sensação Térmica (°C)': log.feelsLike || log.temperature,
      'Pressão (hPa)': log.pressure || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados Climáticos');

    const outputPath = path.join(process.cwd(), 'exports', `weather-${Date.now()}.xlsx`);
    
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    XLSX.writeFile(workbook, outputPath);
    
    return outputPath;
  }

  private average(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
}