import { Injectable } from '@nestjs/common';
import { PrismaService } from 'database/prisma.service';
import * as ExcelJS from 'exceljs';
import { CreateWeatherDto } from './dto/create-weather.dto';
@Injectable()
export class WeatherService {
  constructor(private readonly prisma: PrismaService) {}

  async findLatest(lat: number, lon: number) {
    return await this.prisma.weatherSample.findFirst({
      where: { lat, lon },
      orderBy: { timestamp: 'desc' },
    });
  }

  async create(createWeatherDto: CreateWeatherDto) {
    console.log({ createWeatherDto });
    return this.prisma.weatherSample.create({
      data: {
        ...createWeatherDto,
        timestamp: new Date(createWeatherDto.timestamp),
      },
    });
  }

  findAll() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.prisma.weatherSample.findMany({
      where: {
        createdAt: {
          gte: since,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async exportXLSX() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const data = await this.prisma.weatherSample.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
    });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Weather Data');
    sheet.columns = [
      { header: 'Data/Hora', key: 'createdAt', width: 20 },
      { header: 'Latitude', key: 'lat', width: 12 },
      { header: 'Longitude', key: 'lon', width: 12 },
      { header: 'Temperatura (°C)', key: 'temperatureC', width: 18 },
      { header: 'Umidade (%)', key: 'humidity', width: 15 },
      { header: 'Vento (m/s)', key: 'windSpeedMs', width: 15 },
      { header: 'Direção do Vento', key: 'windDirection', width: 18 },
    ];
    data.forEach((entry) => {
      sheet.addRow({
        createdAt: entry.createdAt,
        lat: entry.lat,
        lon: entry.lon,
        temperatureC: entry.temperatureC,
        humidity: entry.humidity,
        windSpeedMs: entry.windSpeedMs,
        windDirection: entry.windDirection,
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
