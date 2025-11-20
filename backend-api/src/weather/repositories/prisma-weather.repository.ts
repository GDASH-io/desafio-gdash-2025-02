import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WeatherRepository } from './weather.repository';
import { CreateWeatherDto } from '../dto/create-weather.dto';

@Injectable()
export class PrismaWeatherRepository implements WeatherRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateWeatherDto) {
    return this.prisma.weatherLog.create({
      data: {
        location: data.location,
        temperature: data.temperature,
        humidity: data.humidity,
        windSpeed: data.windSpeed,
        conditionCode: data.conditionCode,
        collectedAt: new Date(data.collectedAt), 
      },
    });
  }

  async findAll() {
    return this.prisma.weatherLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}