import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather } from './schemas/weather.schema';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { OpenAI } from 'openai';
import * as ExcelJS from 'exceljs';
import { Parser } from 'json2csv';

@Injectable()
export class WeatherService {
  private openai: OpenAI;

  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<Weather>,
  ) {
    // Inicializar OpenAI se a chave estiver disponível
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async create(createWeatherDto: CreateWeatherDto): Promise<Weather> {
    const weather = new this.weatherModel(createWeatherDto);
    return weather.save();
  }

  async findAll(limit = 100, city?: string): Promise<Weather[]> {
    const query = city ? { city } : {};
    return this.weatherModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findById(id: string): Promise<Weather> {
    return this.weatherModel.findById(id).exec();
  }

  async getStatistics() {
    const data = await this.weatherModel.find().exec();

    if (data.length === 0) {
      return {
        total: 0,
        cities: [],
        avgTemp: 0,
        avgHumidity: 0,
      };
    }

    const cities = [...new Set(data.map(d => d.city))];
    const avgTemp = data.reduce((acc, d) => acc + d.temperature, 0) / data.length;
    const avgHumidity = data.reduce((acc, d) => acc + d.humidity, 0) / data.length;

    return {
      total: data.length,
      cities,
      avgTemp: Math.round(avgTemp * 10) / 10,
      avgHumidity: Math.round(avgHumidity * 10) / 10,
    };
  }

  async generateInsights(): Promise<any> {
    const recentData = await this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();

    if (recentData.length === 0) {
      return {
        insights: 'Não há dados suficientes para gerar insights.',
        usedAI: false,
      };
    }

    // Se não tiver OpenAI configurada, retornar insights básicos
    if (!this.openai) {
      return this.generateBasicInsights(recentData);
    }

    // Gerar insights com IA
    try {
      const summary = this.prepareSummaryForAI(recentData);

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-nano',
        messages: [
          {
            role: 'system',
            content:
              'Você é um analista meteorológico experiente. Analise os dados e forneça apenas o texto de insights, em português, sem ofertas adicionais de ajuda, sem perguntas ao usuário e sem comentários genéricos como "se desejar" ou "posso ajudar". Foque só em observações e recomendações objetivas.',
          },
          {
            role: 'user',
            content: `Analise estes dados climáticos e forneça insights objetivos, em formato de parágrafos curtos ou lista de tópicos, sem comentários adicionais ou convite ao usuário:\n\n${summary}`,
          },
        ],
        max_tokens: 2000,
      });

      return {
        insights: completion.choices[0].message.content,
        usedAI: true,
        model: process.env.OPENAI_MODEL || 'gpt-4.1-nano',
      };
    } catch (error) {
      console.error('Erro ao gerar insights com IA:', error.message);
      return this.generateBasicInsights(recentData);
    }
  }

  private generateBasicInsights(data: Weather[]) {
    const cities = [...new Set(data.map(d => d.city))];
    const avgTemp = data.reduce((acc, d) => acc + d.temperature, 0) / data.length;
    const maxTemp = Math.max(...data.map(d => d.temperature));
    const minTemp = Math.min(...data.map(d => d.temperature));

    const insights = `
Weather Data Analysis

Cities: ${cities.join(', ')}
Records analyzed: ${data.length}

Temperature:
- Average: ${avgTemp.toFixed(1)}°C
- Max: ${maxTemp}°C
- Min: ${minTemp}°C

Average Humidity: ${(data.reduce((acc, d) => acc + d.humidity, 0) / data.length).toFixed(1)}%

Note: Configure OPENAI_API_KEY for AI-powered insights
    `.trim();

    return {
      insights,
      usedAI: false,
    };
  }

  private prepareSummaryForAI(data: Weather[]): string {
    const cities = [...new Set(data.map(d => d.city))];
    
    let summary = `Dados de ${data.length} registros de ${cities.length} cidades: ${cities.join(', ')}\n\n`;

    cities.forEach(city => {
      const cityData = data.filter(d => d.city === city);
      const avgTemp = cityData.reduce((acc, d) => acc + d.temperature, 0) / cityData.length;
      const avgHumidity = cityData.reduce((acc, d) => acc + d.humidity, 0) / cityData.length;

      summary += `${city}:\n`;
      summary += `- Temperatura média: ${avgTemp.toFixed(1)}°C\n`;
      summary += `- Umidade média: ${avgHumidity.toFixed(1)}%\n`;
      summary += `- Descrição mais recente: ${cityData[0].description}\n\n`;
    });

    return summary;
  }

  async exportToCSV(): Promise<string> {
    const data = await this.weatherModel.find().exec();

    const fields = [
      'city',
      'country',
      'temperature',
      'feels_like',
      'humidity',
      'pressure',
      'description',
      'wind_speed',
      'clouds',
      'timestamp',
    ];

    const parser = new Parser({ fields });
    return parser.parse(data);
  }

  async exportToExcel(): Promise<Buffer> {
    const data = await this.weatherModel.find().exec();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Weather Data');

    worksheet.columns = [
      { header: 'Cidade', key: 'city', width: 20 },
      { header: 'País', key: 'country', width: 10 },
      { header: 'Temperatura', key: 'temperature', width: 15 },
      { header: 'Sensação', key: 'feels_like', width: 15 },
      { header: 'Umidade', key: 'humidity', width: 12 },
      { header: 'Pressão', key: 'pressure', width: 12 },
      { header: 'Descrição', key: 'description', width: 25 },
      { header: 'Vento', key: 'wind_speed', width: 12 },
      { header: 'Nuvens', key: 'clouds', width: 12 },
      { header: 'Data/Hora', key: 'timestamp', width: 20 },
    ];

    data.forEach(item => {
      worksheet.addRow({
        city: item.city,
        country: item.country,
        temperature: item.temperature,
        feels_like: item.feels_like,
        humidity: item.humidity,
        pressure: item.pressure,
        description: item.description,
        wind_speed: item.wind_speed,
        clouds: item.clouds,
        timestamp: item.timestamp,
      });
    });

    // Estilizar cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
