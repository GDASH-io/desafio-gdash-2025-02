import { Controller, Get, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { WeatherLog } from './schemas/weather-log.schema';
import { Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Clima')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  @ApiOperation({ summary: 'Cria um novo registro de log de clima' })
  async create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    return this.weatherService.create(createWeatherLogDto);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Retorna todos os registros de log de clima' })
  async findAll(): Promise<WeatherLog[]> {
    return this.weatherService.findAll();
  }

  @Get('insights')
  @ApiOperation({ summary: 'Retorna insights sobre os dados de clima' })
  async getInsights() {
    const averageTemperature = await this.weatherService.getAverageTemperature();
    const temperatureTrend = await this.weatherService.getTemperatureTrend();
    return {
      averageTemperature: parseFloat(averageTemperature.toFixed(2)),
      temperatureTrend,
      message: `A temperatura média é de ${averageTemperature.toFixed(2)}°C. ${temperatureTrend}`,
    };
  }

  @Get('export.csv')
  @ApiOperation({ summary: 'Exporta registros de clima para CSV' })
  async exportCsv(@Res() res: Response) {
    try {
      const data = await this.weatherService.findAll();
      const csv = await this.weatherService.exportCsv();
      res.header('Content-Type', 'text/csv');
      res.attachment('weather_logs.csv');
      return res.send(csv);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Erro ao exportar dados CSV.');
    }
  }

  @Get('export.xlsx')
  @ApiOperation({ summary: 'Exporta registros de clima para XLSX' })
  async exportXlsx(@Res() res: Response) {
    try {
      const buffer = await this.weatherService.exportXlsx();
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment('weather_logs.xlsx');
      return res.send(buffer);
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Erro ao exportar dados XLSX.');
    }
  }
}
