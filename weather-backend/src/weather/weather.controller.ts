import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import * as ExcelJS from 'exceljs';
import { Weather } from 'src/schemas/weather.schema';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post()
  @ApiOperation({ summary: 'Receber dados climáticos' })
  async create(@Body() weatherData: Partial<Weather>) {
    return this.weatherService.create(weatherData);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar dados climáticos com paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'city', required: false, type: String })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('city') city?: string,
  ) {
    return this.weatherService.findAll(page, limit, city);
  }

  @UseGuards(AuthGuard)
  @Get('latest')
  @ApiOperation({ summary: 'Obter o último registro climático' })
  async findLatest(@Query('city') city?: string) {
    return this.weatherService.findLatest(city);
  }

  @UseGuards(AuthGuard)
  @Get('export/csv')
  @ApiOperation({ summary: 'Exportar dados em CSV' })
  async exportCSV(@Res() res: Response, @Query('city') city?: string) {
    const data = await this.weatherService.findAll(1, 1000, city);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=weather-data-${Date.now()}.csv`,
    );

    res.write('Data,Hora,Cidade,Temperatura,Sensação,Umidade,Vento,Condição\n');

    data.data.forEach((record) => {
      const date = new Date(record.collection_time * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = date.toTimeString().split(' ')[0];

      res.write(
        `"${dateStr}","${timeStr}","${record.city}",${record.temperature},${record.feels_like},${record.humidity},${record.wind_speed},"${record.weather_condition}"\n`,
      );
    });

    res.end();
  }

  @UseGuards(AuthGuard)
  @Get('export/xlsx')
  @ApiOperation({ summary: 'Exportar dados em XLSX' })
  async exportXLSX(@Res() res: Response, @Query('city') city?: string) {
    const data = await this.weatherService.findAll(1, 1000, city);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dados Climáticos');

    // Cabeçalhos
    worksheet.columns = [
      { header: 'Data', key: 'date', width: 15 },
      { header: 'Hora', key: 'time', width: 15 },
      { header: 'Cidade', key: 'city', width: 20 },
      { header: 'Temperatura (°C)', key: 'temperature', width: 18 },
      { header: 'Sensação (°C)', key: 'feels_like', width: 18 },
      { header: 'Umidade (%)', key: 'humidity', width: 15 },
      { header: 'Pressão (hPa)', key: 'pressure', width: 15 },
      { header: 'Vento (m/s)', key: 'wind_speed', width: 15 },
      { header: 'Condição', key: 'condition', width: 25 },
    ];

    // Dados
    data.data.forEach((record) => {
      const date = new Date(record.collection_time * 1000);
      worksheet.addRow({
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().split(' ')[0],
        city: record.city,
        temperature: record.temperature,
        feels_like: record.feels_like,
        humidity: record.humidity,
        pressure: record.pressure,
        wind_speed: record.wind_speed,
        condition: record.weather_condition,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=weather-data-${Date.now()}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  @UseGuards(AuthGuard)
  @Get('score/comfort')
  @ApiOperation({ summary: 'Obter o pontuação de conforto' })
  async comfortScore(@Query('city') city?: string) {
    return this.weatherService.comfortScore(city);
  }
}
