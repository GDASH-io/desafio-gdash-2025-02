import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { AiInsightService } from '../ai-insight/ai-insight.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLog>,
    private aiInsightService: AiInsightService,
  ) {}

  async create(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLog> {
    const createdLog = new this.weatherModel(createWeatherLogDto);
    return createdLog.save(); 
  }

  // ATUALIZADO: Agora aceita uma data opcional (formato YYYY-MM-DD)
  async findAll(dateString?: string): Promise<WeatherLog[]> {
    const filter: any = {};

    if (dateString) {
      // Cria o intervalo de 00:00:00 até 23:59:59 para o dia solicitado
      const start = new Date(dateString);
      start.setUTCHours(0, 0, 0, 0); // Usando UTC para padronizar
      
      const end = new Date(dateString);
      end.setUTCHours(23, 59, 59, 999);

      filter.timestamp = {
        $gte: start.toISOString(),
        $lte: end.toISOString(),
      };
      
      // Removemos o limite de 100 se estiver filtrando por dia, queremos o dia todo
      return this.weatherModel.find(filter).sort({ timestamp: 1 }).exec();
    }

    // Se não passar data, retorna os últimos 100 registros (comportamento padrão de fallback)
    return this.weatherModel.find().sort({ timestamp: -1 }).limit(100).exec();
  }

  async getAnalysisForDate(dateString?: string): Promise<any> {
    let start: Date;
    let end: Date;

    if (dateString) {
      // Se passar data (ex: 2025-11-20)
      start = new Date(dateString);
      start.setUTCHours(0, 0, 0, 0);
      
      end = new Date(dateString);
      end.setUTCHours(23, 59, 59, 999);
    } else {
      // Se não passar, usa HOJE
      start = new Date();
      start.setHours(0, 0, 0, 0);
      
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }

    // Busca os logs desse período específico
    const logs = await this.weatherModel.find({
      timestamp: {
        $gte: start.toISOString(),
        $lte: end.toISOString(),
      }
    }).sort({ timestamp: 1 }).exec(); 

    if (!logs || logs.length === 0) {
      return { 
        insight: "Não há dados suficientes nesta data para gerar uma análise precisa.",
        logs_analyzed: 0 
      };
    }

    // Passa os logs filtrados para o AI Service (que não precisa mudar)
    const aiAnalysis = await this.aiInsightService.analyzeDailyLogs(logs);

    return {
      date: start.toISOString(),
      logs_analyzed: logs.length,
      insight: aiAnalysis
    };
  }

  async exportWeatherData(format: 'csv' | 'xlsx'): Promise<Buffer> {
    const logs = await this.weatherModel.find().sort({ timestamp: -1 }).exec();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Histórico Climático');

    worksheet.columns = [
      { header: 'Data/Hora', key: 'timestamp', width: 25 },
      { header: 'Temperatura (°C)', key: 'temperature', width: 15 },
      { header: 'Umidade (%)', key: 'humidity', width: 15 },
      { header: 'Radiação (W/m²)', key: 'radiation', width: 15 },
      { header: 'Vento (km/h)', key: 'wind_speed', width: 15 },
      { header: 'Latitude', key: 'lat', width: 12 },
      { header: 'Longitude', key: 'lon', width: 12 },
    ];

    logs.forEach((log) => {
      worksheet.addRow({
        timestamp: new Date(log.timestamp).toLocaleString('pt-BR'),
        temperature: log.temperature,
        humidity: log.humidity,
        radiation: log.radiation || 0,
        wind_speed: log.wind_speed,
        lat: log.location.lat,
        lon: log.location.lon,
      });
    });

    if (format === 'xlsx') {
      worksheet.getRow(1).font = { bold: true };
    }

    if (format === 'csv') {
      return (await workbook.csv.writeBuffer()) as unknown as Buffer;
    } else {
      return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
    }
  }
}