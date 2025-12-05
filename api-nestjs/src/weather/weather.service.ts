import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Parser } from 'json2csv';
import { WeatherLog, WeatherLogDocument } from './weather.schema';
import { AiService } from '../ai/ai.service';

interface WeatherLogWithDate extends WeatherLog {
    createdAt: Date;
}

@Injectable()
export class WeatherService {
constructor(
    @InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLogDocument>,
    private aiService: AiService
  ) {}

  // CREATE para o Worker Go
  async create(data: any): Promise<WeatherLog> {
    const createdLog = new this.weatherModel(data);
    return createdLog.save();
  }

  // FIND ALL para o Frontend
  async findAll(): Promise<WeatherLog[]> {
    return this.weatherModel.find().sort({ createdAt: -1 }).limit(50).exec();
  }

  // Exportar CSV
  async exportCsv(): Promise<string> {
    const logs = await this.weatherModel.find().lean().sort({ createdAt: -1 }).exec();
    
    const fields = [
      { label: 'Data', value: 'createdAt' },
      { label: 'Temperatura (°C)', value: 'temperature' },
      { label: 'Umidade (%)', value: 'humidity' },
      { label: 'Velocidade do Vento (km/h)', value: 'wind_speed' },
      { label: 'Condição', value: 'condition' },
    ];

    const json2csvParser = new Parser({ fields });
    return json2csvParser.parse(logs);
  }

  async getClimateInsight(): Promise<{ insight: string }> {
    // 1. Buscar um histórico de dados (últimos 8 logs)
    const logs = await this.weatherModel.find().lean().sort({ createdAt: -1 }).limit(8).exec() as WeatherLogWithDate[];
    if (logs.length < 5) {
      return { insight: "Aguardando mais logs (mínimo de 5) para análise de IA." };
    }

    // 2. Formatar os dados para o LLM
    const logsForAI = logs.map(log => ({
      time: log.createdAt, 
      temp: log.temperature, 
      hum: log.humidity,
      lat: log.latitude,
      lon: log.longitude
    }));

    // 3. Chama o Serviço de IA
    const insightText = await this.aiService.generateInsight(JSON.stringify(logsForAI));

    return { insight: insightText };
  }
}