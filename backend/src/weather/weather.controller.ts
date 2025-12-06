import { Controller, Get, Post, Body, Res, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WeatherMapper } from './domain/weather.mapper';
import type { Response } from 'express';
import * as XLSX from 'xlsx';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  async createLog(@Body() body: any) {
    const result = await this.weatherService.createLog(body);
    if (result.isLeft()) {
      return { error: result.value.message };
    }
    return WeatherMapper.toResponse(result.value);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logs')
  async getAllLogs() {
    const logs = await this.weatherService.getAllLogs();
    return WeatherMapper.toResponseList(logs);
  }

  @UseGuards(JwtAuthGuard)
  @Get('insights')
  getInsights() {
    return this.weatherService.getInsights();
  }

  @Get('export/csv')
  async exportCsv(@Res() res: Response) {
    const logs = await this.weatherService.getAllLogs();
    const csv = logs.map(log => `${log.city},${log.temperature},${log.humidity},${log.condition},${log.timestamp}`).join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment('weather_logs.csv');
    return res.send(`City,Temperature,Humidity,Condition,Timestamp\n${csv}`);
  }

  @Get('export/xlsx')
  async exportXlsx(@Res() res: Response) {
    const logs = await this.weatherService.getAllLogs();
    
    // Prepare data for Excel
    const data = logs.map(log => ({
      City: log.city,
      Temperature: log.temperature,
      Humidity: log.humidity,
      'Wind Speed': log.windSpeed,
      Condition: log.condition,
      Timestamp: log.timestamp instanceof Date ? log.timestamp.toLocaleString() : new Date(log.timestamp).toLocaleString()
    }));
    
    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Weather Data');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment('weather_logs.xlsx');
    return res.send(buffer);
  }
}
