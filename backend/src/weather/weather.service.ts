import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { WeatherInsightsDto } from './dto/weather-insights.dto';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Buffer } from 'buffer';

import { ConfigService } from '@nestjs/config';
import * as ExcelJS from 'exceljs';

@Injectable()
export class WeatherService {
  private genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(WeatherService.name);

  private lastInsight: WeatherInsightsDto | null = null;
  private lastInsightTime: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000;

  constructor(
    @InjectModel(WeatherLog.name)
    private weatherModel: Model<WeatherLogDocument>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.error('❌ Chave GEMINI_API_KEY não encontrada no .env!');
    } else {
      this.logger.log('✅ Chave Gemini carregada com sucesso.');
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

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
      const date = new Date(log.timestamp).toLocaleString('pt-BR');
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
        timestamp: new Date(log.timestamp).toLocaleString('pt-BR'),
        temperature: log.temperature,
        humidity: log.humidity,
        wind_speed: log.wind_speed,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generateInsights(): Promise<WeatherInsightsDto> {
    const now = Date.now();
    if (this.lastInsight && now - this.lastInsightTime < this.CACHE_TTL) {
      this.logger.log('🔄 Retornando insight do cache (economizando API)');
      return this.lastInsight;
    }

    const logs = await this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();
    if (logs.length === 0)
      return { summary: 'Sem dados.', trend: 'stable', averageTemp: 0 };

    const current = logs[0];
    const totalTemp = logs.reduce((acc, log) => acc + log.temperature, 0);
    const avgTemp = parseFloat((totalTemp / logs.length).toFixed(1));

    let result: WeatherInsightsDto;

    if (this.genAI) {
      try {
        result = await this.generateGeminiInsights(logs, current, avgTemp);

        this.lastInsight = result;
        this.lastInsightTime = now;

        return result;
      } catch (error) {
        this.logger.error(
          'Falha na IA (Gemini), usando heurística local.',
          error,
        );
      }
    }

    return this.generateHeuristicInsights(logs, current, avgTemp);
  }
  private async generateGeminiInsights(
    logs: WeatherLog[],
    current: WeatherLog,
    avgTemp: number,
  ): Promise<WeatherInsightsDto> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Atue como um meteorologista. Analise estes dados do Rio de Janeiro:
      - Atual: ${current.temperature}°C, ${current.humidity}% humidade, vento ${current.wind_speed}km/h.
      - Média recente: ${avgTemp}°C.
      
      Retorne APENAS um JSON (sem crases ou markdown) neste formato:
      {
        "summary": "Frase curta sobre o clima atual.",
        "alert": "Alerta curto se perigoso, ou null."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const text = response
      .text()
      .replace(/```json|```/g, '')
      .trim();
    const json = JSON.parse(text);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (current.temperature > logs[logs.length - 1].temperature + 0.5)
      trend = 'up';
    else if (current.temperature < logs[logs.length - 1].temperature - 0.5)
      trend = 'down';

    return {
      summary: json.summary,
      trend: trend,
      alert: json.alert,
      averageTemp: avgTemp,
    };
  }

  private generateHeuristicInsights(
    logs: WeatherLog[],
    current: WeatherLog,
    avgTemp: number,
  ): WeatherInsightsDto {
    const previous = logs[logs.length - 1];
    let trend: 'up' | 'down' | 'stable' = 'stable';
    let trendText = 'estável';
    if (current.temperature > previous.temperature + 0.5) {
      trend = 'up';
      trendText = 'a subir';
    } else if (current.temperature < previous.temperature - 0.5) {
      trend = 'down';
      trendText = 'a descer';
    }

    let alert: string | undefined = undefined;
    if (current.wind_speed > 20) alert = '⚠️ Ventos fortes!';
    else if (current.temperature > 35) alert = '⚠️ Calor extremo!';

    return {
      summary: `Temperatura de ${current.temperature}°C e ${trendText}. Média ${avgTemp}°C. (Modo Offline)`,
      trend,
      alert,
      averageTemp: avgTemp,
    };
  }
}
