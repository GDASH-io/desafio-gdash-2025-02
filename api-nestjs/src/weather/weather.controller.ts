import { Body, Controller, Get, Post, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  // Endpoint para salvar (usado pelo Go) - POST
  @Post('logs')
  async createLog(@Body() data: any) {
    console.log('Recebido na API:', data);
    return this.weatherService.create(data); 
  }

  // Endpoint para listar (usado pelo Frontend) - GET
  @UseGuards(AuthGuard('jwt')) 
  @Get('logs')
  async findAll() {
    return this.weatherService.findAll();
  }
  
  // Endpoint de INSIGHTS DE IA 
  @UseGuards(AuthGuard('jwt'))
  @Get('insights') 
  async getInsights() {
    return this.weatherService.getClimateInsight();
  }
  
  // ENDPOINT CSV
  @UseGuards(AuthGuard('jwt'))
  @Get('export.csv')
  async exportCsv(@Res() res: Response): Promise<void> {
    const csvData = await this.weatherService.exportCsv();
    
    // Define os cabeçalhos para forçar o download do arquivo
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="weather_data.csv"');
    
    res.status(200).send(csvData);
  }
}