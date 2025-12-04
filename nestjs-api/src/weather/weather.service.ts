import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather, WeatherDocument } from './schemas/weather.schema';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { ExportService } from './services/export.service';
import { InsightsService } from './services/insights.service';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>,
    private exportService: ExportService,
    private insightsService: InsightsService,
  ) {}

  async create(createWeatherDto: CreateWeatherDto): Promise<Weather> {
    this.logger.log('📥 Recebendo dados climáticos do Go Worker');
    this.logger.log(`   🌡️  ${createWeatherDto.temperature}°C`);
    this.logger.log(`   💧 ${createWeatherDto.humidity}%`);
    this.logger.log(`   🌬️  ${createWeatherDto.wind_speed} km/h`);

    const createdWeather = new this.weatherModel(createWeatherDto);
    const saved = await createdWeather.save();

    this.logger.log('✅ Dados salvos no MongoDB com sucesso!');
    return saved;
  }

  async findAll(limit = 100): Promise<Weather[]> {
    return this.weatherModel.find().sort({ createdAt: -1 }).limit(limit).exec();
  }

  async findRecent(hours = 24): Promise<Weather[]> {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    return this.weatherModel
      .find({ createdAt: { $gte: since } })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getStats() {
    const total = await this.weatherModel.countDocuments();
    const latest = await this.weatherModel.findOne().sort({ createdAt: -1 });

    return {
      total_records: total,
      latest_record: latest,
      collection_active: total > 0,
    };
  }

  async exportToCSV(limit = 1000): Promise<string> {
    const data = await this.findAll(limit);
    return this.exportService.exportToCSV(data);
  }

  async exportToXLSX(limit = 1000): Promise<Buffer> {
    const data = await this.findAll(limit);
    return this.exportService.exportToXLSX(data);
  }

  async generateInsights(hours = 24) {
    const data = await this.findRecent(hours);
    return this.insightsService.generateInsights(data);
  }
}
