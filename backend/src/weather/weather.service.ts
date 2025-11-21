import { Injectable, Logger } from '@nestjs/common';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Weather } from './entities/weather.entity';
import { Model } from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

Dê APENAS 1 frase curta (máx 10 palavras) com um conselho prático.
Exemplos:
- "Ar seco. Beba água e hidrate-se bem."
- "Umidade alta. Dia abafado, mas brisa ajuda."
- "Clima perfeito. Temperatura agradável."

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
      `📊 Novo registro: ${createWeatherDto.temperature}°C, ${createWeatherDto.humidity}% umidade, ${createWeatherDto.windSpeed} km/h vento`,
    );
    return createdWeather.save();
  }

  private generateFallbackInsight(dto: CreateWeatherDto): string {
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

  update(id: number, updateWeatherDto: any) {
    return `This action updates a #${id} weather`;
  }

  remove(id: number) {
    return `This action removes a #${id} weather`;
  }
}
