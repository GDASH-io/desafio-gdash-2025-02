import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { encode } from '@toon-format/toon';
import { commonConstants } from 'src/shared/constants';
import { AiService } from '../ai/ai.service';
import { Insight } from '../ai/schemas/insigthOutputSchema';
import { SpreadsheetService } from '../spreadsheet/spreadsheet.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { CreateWeatherEntity, Weather } from './entities/weather.entity';
import {
  WeatherDataItem,
  WeatherDocument,
} from './infraestructure/schema/weather.schema';
import { WeatherRepositoryPort } from './ports/weather.repository.ports';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  constructor(
    @Inject(commonConstants.ports.WEATHER)
    private readonly weatherRepo: WeatherRepositoryPort,
    private readonly spreadsheetService: SpreadsheetService,
    private readonly aiService: AiService,
  ) {}

  async create(createWeatherDto: CreateWeatherDto) {
    const weatherEntity = CreateWeatherEntity(createWeatherDto);

    const existsingWeather = await this.weatherRepo.getWeather();

    if (!existsingWeather) {
      this.logger.log('Creating new weather document for today');
      const weatherDocument = weatherEntity.toSchema();

      const { embedding, insight } =
        await this.generateEmbeddingAndInsightForWeatherData(
          weatherDocument.data[0],
          encode(JSON.stringify(weatherDocument.data)),
          false,
        );

      if (insight) {
        weatherDocument.insight = insight;
      }
      weatherDocument.embedding = embedding || [];

      await this.weatherRepo.create(weatherDocument);
      this.logger.log('New weather document created for today');
      return;
    }

    this.logger.log('Updating embedding and insight for weather data');
    await this.generateEmbeddingAndInsightForWeatherData(
      existsingWeather.data[existsingWeather.data.length - 1],
      encode(JSON.stringify(existsingWeather.data)),
    );

    this.logger.log("Updating weather data to today's document");
    await this.weatherRepo.updateWeatherData(
      weatherEntity.formattedWeatherDataToSchema(),
    );
  }

  async getWeathers(
    date?: string,
  ): Promise<{ data: WeatherDataItem[] | undefined }> {
    const weather = await this.weatherRepo.getWeathers(date);

    if (!weather) {
      throw new NotFoundException('Nenhum dado disponível para a data de hoje');
    }
    return { data: weather };
  }

  async getAllWeathers(
    limit?: number,
  ): Promise<{ data: WeatherDocument[] | undefined }> {
    const weather = await this.weatherRepo.getAllWeathers(limit);

    if (!weather || weather.length === 0) {
      throw new NotFoundException('Nenhum dado disponível para a data de hoje');
    }

    return { data: weather };
  }

  async getWeather(date?: string): Promise<{
    data: WeatherDataItem | undefined;
    insight: Insight | undefined;
  }> {
    const weather = await this.weatherRepo.getWeather(date);

    if (!weather) {
      throw new NotFoundException('Nenhum dado disponível para a data de hoje');
    }
    return { data: weather?.data?.[0], insight: weather?.insight };
  }

  async exportToCsv(date?: string): Promise<string> {
    const weather = await this.weatherRepo.getWeathers(date);

    return this.spreadsheetService.generateCsv(weather);
  }

  async exportToXlsx(date?: string): Promise<Buffer> {
    const weather = await this.weatherRepo.getWeathers(date);

    const itemsFormtted = Weather.formattedItemsToXlsx(weather || []);

    if (!itemsFormtted) {
      this.logger.error('No weather data available for export to XLSX');
      throw new NotFoundException('Nenhum dado disponível para exportação');
    }

    const data = await this.spreadsheetService.generateXlsx(itemsFormtted);

    return data;
  }

  private async generateEmbeddingAndInsightForWeatherData(
    weatherDataInsight: WeatherDataItem,
    embeddingInput: string,
    update: boolean = true,
  ): Promise<{
    insight: Insight | undefined;
    embedding: number[] | undefined;
  }> {
    const [insight, embeddings] = await Promise.all([
      this.aiService.getInsightsFromData(weatherDataInsight),
      this.aiService.generateEmbedding(embeddingInput),
    ]);

    if (update) {
      await this.weatherRepo.updateInsightsAndEmbeddings({
        ...(insight && { insight: insight }),
        ...(embeddings && { embedding: embeddings }),
      });

      this.logger.log('Updated embedding and insight for weather data');
      return { insight, embedding: embeddings };
    } else {
      return { insight, embedding: embeddings };
    }
  }
}
