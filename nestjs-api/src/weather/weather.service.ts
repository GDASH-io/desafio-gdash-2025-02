import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { stringify } from 'csv-stringify';
import * as ExcelJS from 'exceljs';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';

interface CacheEntry {
  data: any;
  timestamp: number;
}

@Injectable()
export class WeatherService {
  private readonly OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
  private readonly OPEN_METEO_ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';
  
  private readonly forecastCache = new Map<string, CacheEntry>();
  private readonly historyCache = new Map<string, CacheEntry>();
  private readonly FORECAST_CACHE_TTL = 10 * 60 * 1000;
  private readonly HISTORY_CACHE_TTL = 30 * 60 * 1000;

  constructor(
    @InjectModel(WeatherLog.name) private weatherLogModel: Model<WeatherLog>,
    private readonly httpService: HttpService,
  ) {
    setInterval(() => this.cleanExpiredCache(), 5 * 60 * 1000);
  }

  private getForecastCacheKey(latitude: number, longitude: number): string {
    const latRounded = Math.round(latitude * 10) / 10;
    const lonRounded = Math.round(longitude * 10) / 10;
    return `forecast_${latRounded}_${lonRounded}`;
  }

  private getHistoryCacheKey(latitude: number, longitude: number, days: number): string {
    const latRounded = Math.round(latitude * 10) / 10;
    const lonRounded = Math.round(longitude * 10) / 10;
    return `history_${latRounded}_${lonRounded}_${days}`;
  }

  private getFromForecastCache(key: string): any | null {
    const entry = this.forecastCache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.FORECAST_CACHE_TTL) {
      this.forecastCache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setForecastCache(key: string, data: any): void {
    this.forecastCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private getFromHistoryCache(key: string): any | null {
    const entry = this.historyCache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.HISTORY_CACHE_TTL) {
      this.historyCache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setHistoryCache(key: string, data: any): void {
    this.historyCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.forecastCache.entries()) {
      if (now - entry.timestamp > this.FORECAST_CACHE_TTL) {
        this.forecastCache.delete(key);
      }
    }
    
    for (const [key, entry] of this.historyCache.entries()) {
      if (now - entry.timestamp > this.HISTORY_CACHE_TTL) {
        this.historyCache.delete(key);
      }
    }
  }

  async getWeatherForecast(latitude: number, longitude: number): Promise<any> {
    const cacheKey = this.getForecastCacheKey(latitude, longitude);
    const cached = this.getFromForecastCache(cacheKey);
    if (cached) {
      console.log('✅ [Weather] Previsão do tempo retornada do cache para:', latitude, longitude);
      return cached;
    }

    try {
      console.log('🌤️ [Weather] Buscando previsão do tempo da API para:', latitude, longitude);
      const params = {
        latitude,
        longitude,
        hourly: 'temperature_2m,apparent_temperature,weathercode,precipitation_probability,relativehumidity_2m,uv_index',
        daily: 'weathercode,temperature_2m_max,temperature_2m_min,uv_index_max',
        current_weather: true,
        timezone: 'auto',
      };

      const response = await firstValueFrom(
        this.httpService.get(this.OPEN_METEO_BASE_URL, { params }),
      );
      
      this.setForecastCache(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch weather forecast from Open-Meteo', error.message);
    }
  }

  async getWeatherHistory(latitude: number, longitude: number, days: number = 7): Promise<any> {
    const cacheKey = this.getHistoryCacheKey(latitude, longitude, days);
    const cached = this.getFromHistoryCache(cacheKey);
    if (cached) {
      console.log('✅ [Weather] Histórico do tempo retornado do cache para:', latitude, longitude, days, 'dias');
      return cached;
    }

    try {
      console.log('📊 [Weather] Buscando histórico do tempo da API para:', latitude, longitude, days, 'dias');
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const params = {
        latitude,
        longitude,
        daily: 'weathercode,temperature_2m_max,temperature_2m_min',
        start_date: startDateStr,
        end_date: endDateStr,
        timezone: 'auto',
      };

      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);
      const useArchive = endDate <= todayMidnight;

      const baseUrl = useArchive ? this.OPEN_METEO_ARCHIVE_URL : this.OPEN_METEO_BASE_URL;

      const response = await firstValueFrom(
        this.httpService.get(baseUrl, { params }),
      );
      
      this.setHistoryCache(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch weather history from Open-Meteo', error.message);
    }
  }

  async create(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLog> {
    const createdWeatherLog = new this.weatherLogModel(createWeatherLogDto);
    return createdWeatherLog.save();
  }

  async findAll(city?: string): Promise<WeatherLog[]> {
    if (city) {
      return this.weatherLogModel.find({ city }).exec();
    }
    return this.weatherLogModel.find().exec();
  }

  async createLogFromApi(city: string, cityCoordinatesService: any): Promise<WeatherLog> {
    const cityData = cityCoordinatesService.getCoordinates(city);
    
    if (!cityData) {
      throw new Error(`Cidade "${city}" não encontrada`);
    }

    const params = {
      latitude: cityData.latitude,
      longitude: cityData.longitude,
      hourly: 'temperature_2m,apparent_temperature,weathercode,precipitation_probability,relativehumidity_2m,uv_index',
      daily: 'weathercode,temperature_2m_max,temperature_2m_min,uv_index_max',
      current_weather: true,
      timezone: 'auto',
    };

    const response = await firstValueFrom(
      this.httpService.get(this.OPEN_METEO_BASE_URL, { params }),
    );
    
    const forecast = response.data;
    
    const logData = {
      timestamp: new Date().toISOString(),
      latitude: cityData.latitude,
      longitude: cityData.longitude,
      temperature: forecast.current_weather.temperature,
      windspeed: forecast.current_weather.windspeed,
      weathercode: forecast.current_weather.weathercode,
      is_day: forecast.current_weather.is_day,
      humidity: forecast.hourly?.relativehumidity_2m?.[0],
      precipitation_probability: forecast.hourly?.precipitation_probability?.[0],
      city: city,
    } as CreateWeatherLogDto;

    return this.create(logData);
  }

  async createLogFromCoordinates(latitude: number, longitude: number, cityCoordinatesService: any): Promise<WeatherLog> {
    const params = {
      latitude,
      longitude,
      hourly: 'temperature_2m,apparent_temperature,weathercode,precipitation_probability,relativehumidity_2m,uv_index',
      daily: 'weathercode,temperature_2m_max,temperature_2m_min,uv_index_max',
      current_weather: true,
      timezone: 'auto',
    };

    const response = await firstValueFrom(
      this.httpService.get(this.OPEN_METEO_BASE_URL, { params }),
    );
    
    const forecast = response.data;
    
    const foundCity = cityCoordinatesService.getCityByCoordinates(latitude, longitude, 0.3);
    
    const logData = {
      timestamp: new Date().toISOString(),
      latitude,
      longitude,
      temperature: forecast.current_weather.temperature,
      windspeed: forecast.current_weather.windspeed,
      weathercode: forecast.current_weather.weathercode,
      is_day: forecast.current_weather.is_day,
      humidity: forecast.hourly?.relativehumidity_2m?.[0],
      precipitation_probability: forecast.hourly?.precipitation_probability?.[0],
      city: foundCity?.name || undefined,
    } as CreateWeatherLogDto;

    return this.create(logData);
  }

  async deleteByCity(city: string): Promise<{ deletedCount: number }> {
    const result = await this.weatherLogModel.deleteMany({ city }).exec();
    return { deletedCount: result.deletedCount || 0 };
  }

  async deleteByCoordinates(latitude: number, longitude: number, tolerance: number = 0.5): Promise<{ deletedCount: number }> {
    try {
      const result = await this.weatherLogModel.deleteMany({
        $and: [
          { latitude: { $gte: latitude - tolerance, $lte: latitude + tolerance } },
          { longitude: { $gte: longitude - tolerance, $lte: longitude + tolerance } },
        ],
      }).exec();
      return { deletedCount: result.deletedCount || 0 };
    } catch (error) {
      console.error('❌ [Weather] Erro ao deletar por coordenadas:', error);
      throw new Error(`Erro ao deletar logs por coordenadas: ${error.message}`);
    }
  }

  async getAverageTemperature(): Promise<number> {
    const result = await this.weatherLogModel.aggregate([
      { $group: { _id: null, averageTemperature: { $avg: '$temperature' } } },
    ]).exec();

    if (result.length > 0) {
      return result[0].averageTemperature;
    }
    return 0;
  }

  async getTemperatureTrend(): Promise<string> {
    const latestLogs = await this.weatherLogModel.find()
      .sort({ timestamp: -1 })
      .limit(5)
      .exec();

    if (latestLogs.length < 2) {
      return "Dados insuficientes para determinar a tendência.";
    }

    let increasing = 0;
    let decreasing = 0;
    for (let i = 0; i < latestLogs.length - 1; i++) {
      if (latestLogs[i].temperature > latestLogs[i+1].temperature) {
        increasing++;
      } else if (latestLogs[i].temperature < latestLogs[i+1].temperature) {
        decreasing++;
      }
    }

    if (increasing > decreasing) {
      return "A temperatura está em tendência de alta.";
    } else if (decreasing > increasing) {
      return "A temperatura está em tendência de baixa.";
    } else {
      return "A temperatura está relativamente estável.";
    }
  }

  private sortLogs(logs: WeatherLog[]): WeatherLog[] {
    return [...logs].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });
  }

  async exportCsv(city?: string): Promise<string> {
    const logs = this.sortLogs(await this.findAll(city));
    const rows = logs.map(log => ({
      timestamp: log.timestamp instanceof Date ? log.timestamp.toISOString() : log.timestamp,
      city: log.city || 'N/A',
      temperature: log.temperature,
      humidity: log.humidity ?? '',
      windspeed: log.windspeed,
      weathercode: log.weathercode,
      is_day: log.is_day ? 'Dia' : 'Noite',
      precipitation_probability: log.precipitation_probability ?? '',
    }));

    const columns = [
      { key: 'timestamp', header: 'Carimbo de Tempo' },
      { key: 'city', header: 'Local' },
      { key: 'temperature', header: 'Temperatura (°C)' },
      { key: 'humidity', header: 'Umidade (%)' },
      { key: 'windspeed', header: 'Vento (km/h)' },
      { key: 'weathercode', header: 'Código do Clima' },
      { key: 'is_day', header: 'Período' },
      { key: 'precipitation_probability', header: 'Probabilidade de Precipitação (%)' },
    ];

    return new Promise((resolve, reject) => {
      stringify(rows, { header: true, columns }, (err, output) => {
        if (err) return reject(err);
        resolve(output);
      });
    });
  }

  async exportXlsx(city?: string): Promise<Buffer> {
    const logs = this.sortLogs(await this.findAll(city));
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Weather Logs');

    worksheet.columns = [
      { header: 'Carimbo de Tempo', key: 'timestamp', width: 20 },
      { header: 'Local', key: 'city', width: 20 },
      { header: 'Temperatura (°C)', key: 'temperature', width: 18 },
      { header: 'Umidade (%)', key: 'humidity', width: 15 },
      { header: 'Vento (km/h)', key: 'windspeed', width: 15 },
      { header: 'Código do Clima', key: 'weathercode', width: 15 },
      { header: 'Período', key: 'is_day', width: 12 },
      { header: 'Probabilidade de Precipitação (%)', key: 'precipitation_probability', width: 30 },
    ];

    logs.forEach(log => {
      worksheet.addRow({
        timestamp: log.timestamp instanceof Date ? log.timestamp.toISOString() : log.timestamp,
        city: log.city || 'N/A',
        temperature: log.temperature,
        windspeed: log.windspeed,
        weathercode: log.weathercode,
        is_day: log.is_day ? 'Dia' : 'Noite',
        humidity: log.humidity ?? '',
        precipitation_probability: log.precipitation_probability ?? '',
      });
    });

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }
}
