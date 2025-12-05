import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from './weather.schema';
import { CreateWeatherLogDto, WeatherLogResponseDto } from './weather.dto';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLogDocument>,
  ) {}

  async create(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLogDocument> {
    // Converter timestamp string para Date
    const timestamp = new Date(createWeatherLogDto.timestamp);
    
    // Arredondar timestamp para o início da hora para verificar duplicatas
    const hourStart = new Date(timestamp);
    hourStart.setMinutes(0, 0, 0);
    const hourEnd = new Date(hourStart);
    hourEnd.setHours(hourEnd.getHours() + 1);
    
    // Verificar se já existe um registro para esta hora
    const existingLog = await this.weatherLogModel.findOne({
      timestamp: {
        $gte: hourStart,
        $lt: hourEnd,
      },
      location: createWeatherLogDto.location,
    });
    
    if (existingLog) {
      // Se já existe, atualizar o registro existente em vez de criar um novo
      existingLog.temperature = createWeatherLogDto.temperature;
      existingLog.humidity = createWeatherLogDto.humidity;
      existingLog.windSpeed = createWeatherLogDto.windSpeed;
      existingLog.condition = createWeatherLogDto.condition;
      existingLog.rainProbability = createWeatherLogDto.rainProbability;
      existingLog.description = createWeatherLogDto.description;
      existingLog.visibility = createWeatherLogDto.visibility;
      existingLog.solarRadiation = createWeatherLogDto.solarRadiation;
      existingLog.windDirection = createWeatherLogDto.windDirection;
      existingLog.pressure = createWeatherLogDto.pressure;
      existingLog.timestamp = timestamp; // Atualizar timestamp para o valor mais recente
      return existingLog.save();
    }
    
    // Se não existe, criar novo registro
    const logData = {
      ...createWeatherLogDto,
      timestamp,
    };
    const createdLog = new this.weatherLogModel(logData);
    return createdLog.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 50,
    location?: string,
  ): Promise<{ data: WeatherLogResponseDto[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const query = location ? { location: new RegExp(location, 'i') } : {};

    const [data, total] = await Promise.all([
      this.weatherLogModel.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).exec(),
      this.weatherLogModel.countDocuments(query).exec(),
    ]);

    return {
      data: data.map((log) => this.toResponseDto(log)),
      total,
      page,
      limit,
    };
  }

  async findRecent(limit: number = 10): Promise<WeatherLogResponseDto[]> {
    const logs = await this.weatherLogModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();

    return logs.map((log) => this.toResponseDto(log));
  }

  async findById(id: string): Promise<WeatherLogDocument | null> {
    return this.weatherLogModel.findById(id).exec();
  }

  async getHistoricalData(days: number = 7): Promise<WeatherLogDocument[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.weatherLogModel
      .find({
        timestamp: { $gte: startDate },
      })
      .sort({ timestamp: 1 })
      .exec();
  }

  private toResponseDto(log: WeatherLogDocument): WeatherLogResponseDto {
    return {
      _id: log._id.toString(),
      timestamp: log.timestamp,
      location: log.location,
      latitude: log.latitude,
      longitude: log.longitude,
      temperature: log.temperature,
      humidity: log.humidity,
      windSpeed: log.windSpeed,
      condition: log.condition,
      rainProbability: log.rainProbability,
      description: log.description,
      visibility: log.visibility,
      solarRadiation: log.solarRadiation,
      windDirection: log.windDirection,
      pressure: log.pressure,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    };
  }
}

