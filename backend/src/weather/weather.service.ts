import { Injectable, Logger } from '@nestjs/common';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Weather } from './entities/weather.entity';
import { Model } from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as XLSX from 'xlsx';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private genAI: GoogleGenerativeAI;

  constructor(@InjectModel(Weather.name) private weatherModel: Model<Weather>) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async create(createWeatherDto: CreateWeatherDto): Promise<Weather> {
    let generatedInsight = '';

    try {
      if (!process.env.GEMINI_API_KEY) throw new Error('Sem API KEY');

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });

      const prompt = `Você é um meteorologista. Analise rapidamente:
- Temp: ${createWeatherDto.temperature}°C
- Umidade: ${createWeatherDto.humidity}%
- Vento: ${createWeatherDto.windSpeed} km/h
- Chance de Chuva: ${createWeatherDto.rainProbability}%

Dê APENAS 1 frase curta (máx 12 palavras) com um conselho prático considerando a chuva.
Exemplos:
- "Chuva provável (80%). Leve guarda-chuva."
- "Pouca chance de chuva. Dia ensolarado previsto!"
- "50% de chuva. Tempo instável. Tenha cuidado."
- "Ar seco e sem chuva. Dia perfeito pra atividades."

Responda SÓ COM A FRASE, nada mais.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      generatedInsight = response.text();

      this.logger.log(`✅ Insight (Gemini 2.5) gerado: "${generatedInsight}"`);
    } catch (error) {
      this.logger.warn(
        `⚠️ Falha na IA. Usando fallback. Erro: ${String(error).substring(0, 50)}`,
      );
      generatedInsight = this.generateFallbackInsight(createWeatherDto);
    }

    const createdWeather = new this.weatherModel({
      ...createWeatherDto,
      insight: generatedInsight,
    });

    this.logger.log(
      `📊 Novo registro: ${createWeatherDto.temperature}°C, ${createWeatherDto.humidity}% umidade, ${createWeatherDto.windSpeed} km/h vento, ${createWeatherDto.rainProbability}% chuva`,
    );
    return createdWeather.save();
  }

  private generateFallbackInsight(dto: CreateWeatherDto): string {
    if (dto.rainProbability > 70) {
      return 'Chuva forte prevista! Leve guarda-chuva.';
    }
    if (dto.rainProbability > 50) {
      return 'Chance alta de chuva. Tenha cuidado.';
    }
    if (dto.rainProbability > 20) {
      return 'Possível chuva. Acompanhe as atualizações.';
    }
    if (dto.humidity < 30) return 'Ar muito seco! Beba água e hidrate-se.';
    if (dto.humidity > 80) return 'Umidade alta. Sensação de abafamento.';
    if (dto.temperature > 30) return 'Calor intenso! Evite o sol forte.';
    if (dto.temperature < 15) return 'Frio detectado. Leve um casaco.';
    if (dto.windSpeed > 20) return 'Ventos fortes. Cuidado com janelas.';
    return 'Clima agradável e condições estáveis.';
  }

  findAll() {
    return this.weatherModel.find().sort({ createdAt: -1 }).exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} weather`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateWeatherDto: any) {
    return `This action updates a #${id} weather`;
  }

  remove(id: number) {
    return `This action removes a #${id} weather`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async exportToCsv(): Promise<Buffer> {
    try {
      const weatherData = await this.weatherModel.find().lean().exec();

      if (!weatherData || weatherData.length === 0) {
        return Buffer.from('No data available');
      }

      // Prepara headers do CSV
      const headers = [
        'Data/Hora',
        'Temperatura (°C)',
        'Umidade (%)',
        'Vento (km/h)',
        'Chance de Chuva (%)',
        'Insight',
      ];

      // Prepara linhas de dados
      const rows = (weatherData as any[]).map((weather: any) => [
        new Date(weather.createdAt).toLocaleString('pt-BR'),
        weather.temperature?.toString() || 'N/A',
        weather.humidity?.toString() || 'N/A',
        weather.windSpeed?.toString() || 'N/A',
        weather.rainProbability?.toString() || 'N/A',
        weather.insight || 'N/A',
      ]);

      // Constrói CSV
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      this.logger.log(`✅ CSV exportado com ${weatherData.length} registros`);
      return Buffer.from(csvContent, 'utf-8');
    } catch (error) {
      this.logger.error(
        `❌ Erro ao exportar CSV: ${String(error).substring(0, 100)}`,
      );
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async exportToXlsx(): Promise<Buffer> {
    try {
      const weatherData = await this.weatherModel.find().lean().exec();

      if (!weatherData || weatherData.length === 0) {
        return Buffer.from('No data available');
      }

      // Prepara dados para XLSX
      const xlsxData = (weatherData as any[]).map((weather: any) => ({
        'Data/Hora': new Date(weather.createdAt).toLocaleString('pt-BR'),
        'Temperatura (°C)': weather.temperature || 'N/A',
        'Umidade (%)': weather.humidity || 'N/A',
        'Vento (km/h)': weather.windSpeed || 'N/A',
        'Chance de Chuva (%)': weather.rainProbability || 'N/A',
        Insight: weather.insight || 'N/A',
      }));

      // Cria workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(xlsxData);

      // Define largura das colunas
      worksheet['!cols'] = [
        { wch: 20 }, // Data/Hora
        { wch: 15 }, // Temperatura
        { wch: 12 }, // Umidade
        { wch: 12 }, // Vento
        { wch: 18 }, // Chance de Chuva
        { wch: 25 }, // Insight
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Weather Data');

      // Exporta para buffer
      const xlsxBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'buffer',
      });

      this.logger.log(`✅ XLSX exportado com ${weatherData.length} registros`);
      return xlsxBuffer;
    } catch (error) {
      this.logger.error(
        `❌ Erro ao exportar XLSX: ${String(error).substring(0, 100)}`,
      );
      throw error;
    }
  }
}
