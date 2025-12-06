import { Controller, Post, Body, Get, Res, UseGuards } from '@nestjs/common'; // 1. Adicionado UseGuards
import { WeatherService } from './weather.service';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'; 

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post()
  create(@Body() createWeatherDto: any) {
    return this.weatherService.create(createWeatherDto);
  }

  @UseGuards(JwtAuthGuard) 
  @Get()
  findAll() {
    return this.weatherService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('insights')
  getInsights() {
    return this.weatherService.getInsights();
  }

  @UseGuards(JwtAuthGuard)
  @Get('export/csv')
  async exportCSV(@Res() res: Response) {
    const csv = await this.weatherService.exportToCSV();
    res.header('Content-Disposition', 'attachment; filename=historico_clima.csv');
    res.type('text/csv');
    res.send(csv);
  }

  @UseGuards(JwtAuthGuard) 
  @Get('export/xlsx')
  async exportXLSX(@Res() res: Response) {
    const buffer = await this.weatherService.exportToXLSX();
    res.header('Content-Disposition', 'attachment; filename=historico_clima.xlsx');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  }
}