import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as XLSX from 'xlsx';
import { Parser } from 'json2csv';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { Weather } from './entities/weather.entity';
import { WeatherResponseDto } from './dto/weather-response.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IWeatherRepository } from './repositories/weather.repository.interface';
import { log } from 'console';

@Injectable()
export class WeatherService {
  private genAIApi: GoogleGenerativeAI;
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    @Inject('IWeatherRepository')
    private readonly weatherRepository: IWeatherRepository,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    // Busca a chave no .env (Gerada no Google AI Studio, independente do seu plano pessoal)
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (apiKey) {
      this.genAIApi = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn(
        'GEMINI_API_KEY não encontrada. Insights de IA desativados.',
      );
    }
  }

  // --- 1. RECEBER DADOS DO GO ---
  async create(createWeatherDto: CreateWeatherDto): Promise<Weather> {
    const savedWeatherDataLog =
      await this.weatherRepository.create(createWeatherDto);

    // Limpa o cache para garantir dados atualizados
    await this.cacheManager.clear();

    return savedWeatherDataLog;
  }

  // --- 2. LISTAR DADOS (Paginado ou Geral) ---

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<WeatherResponseDto> {
    const skip = (page - 1) * limit;

    const { data, total } = await this.weatherRepository.findAll(skip, limit);

    return {
      data,
      total,
      page,
      last_page: Math.ceil(total / limit),
    };
  }

  // --- 3. GERAR INSIGHTS COM IA ---
  async generateInsights() {
    // Busca os últimos 10 registros para contexto
    const weatherDataLog = await this.weatherRepository.findLatest(10);

    if (!weatherDataLog.length)
      return { message: 'Dados insuficientes para análise.' };

    if (!this.genAIApi) {
      return { message: 'Funcionalidade de IA indisponível (Falta API Key).' };
    }

    try {
      // Usa o modelo Flash (Rápido e Grátis no AI Studio)
      const model = this.genAIApi.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });

      // Prepara os dados para a IA ler
      const dataContext = JSON.stringify(
        weatherDataLog.map((l) => ({
          temp: l.temperature,
          hum: l.humidity,
          wind: l.wind_speed,
          date: l.collected_at,
        })),
      );

      const prompt = `
        Atue como um meteorologista. Analise estes dados climáticos recentes (JSON): ${dataContext} e use um vocabulario rico sem repetir muito as palavras.
        
        Retorne APENAS um objeto JSON seguindo estritamente este esquema:
        {
          "summary": "Resumo da tendência climática em uma frase curta (Português)",
          "alert": "Algum alerta? (Calor, Frio, Chuva, Vento) ou 'Normal'",
          "recommendation": "Dica curta para a pessoa (Ex: Beber água, levar guarda-chuva)",
           "temperature_next_hour": "Tendencia de temperatura para coleção em °C. Use apenas número exemplo '25.4'. Dê preferencia para o ultimo valor da coleção",
          "predicted_weather_next_hour": "Previsão do tempo para a próxima hora informando humidade (valor ex: '65%') e vento (valor ex: '12 km/h') em uma frase curta"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const aiJson = JSON.parse(response.text());
      console.log('Resposta da IA:', aiJson);

      return {
        source: 'Google Gemini 2.5 Flash',
        analysis_date: new Date(),
        ...aiJson,
        raw_data_samples: weatherDataLog.length,
      };
    } catch (error) {
      this.logger.error('Erro ao chamar Gemini', error);
      return {
        message: 'IA indisponível no momento.',
        error_details:
          error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // --- 4. GERAR CSV ---
  async generateCsv(): Promise<string> {
    const dataWeatherLogs = await this.weatherRepository.findAllForExport(2000); // Ajuste conforme necessário

    if (!dataWeatherLogs.length) return '';

    const fields = [
      'location_lat',
      'location_lon',
      'temperature',
      'humidity',
      'wind_speed',
      'condition_code',
      'collected_at',
    ];

    const parser = new Parser({ fields });
    return parser.parse(dataWeatherLogs);
  }

  // --- 5. GERAR EXCEL (XLSX) ---
  async generateXlsx(): Promise<Buffer> {
    const dataWeatherLogs = await this.weatherRepository.findAllForExport(2000); // Ajuste conforme necessário

    if (!dataWeatherLogs.length) return Buffer.from([]);

    // Cria a planilha
    const worksheet = XLSX.utils.json_to_sheet(dataWeatherLogs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados Climáticos');

    // Retorna o buffer binário
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
