import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { WeatherInsightsService } from './weather-insights.service';
import { WeatherCollectorService } from './weather-collector.service';
import {
  CreateWeatherLogDto,
  WeatherLogResponseDto,
  WeatherInsightsDto,
} from './weather.dto';
import * as XLSX from 'xlsx';
import * as csvWriter from 'csv-writer';

@ApiTags('Weather')
@Controller('api/weather')
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly insightsService: WeatherInsightsService,
    private readonly collectorService: WeatherCollectorService,
  ) {}

  @Post('logs')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar registro de clima (usado pelo worker)' })
  @ApiResponse({ status: 201, description: 'Registro criado com sucesso' })
  async create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    const createdLog = await this.weatherService.create(createWeatherLogDto);
    // Invalidar cache de insights para forçar atualização com novos dados
    this.insightsService.invalidateCache();
    return createdLog;
  }

  @Get('logs')
  @ApiOperation({ summary: 'Listar registros climáticos' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiResponse({ status: 200, type: [WeatherLogResponseDto] })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('location') location?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.weatherService.findAll(pageNum, limitNum, location);
  }

  @Get('insights')
  @ApiOperation({
    summary: 'Obter insights de IA sobre o clima baseado na última coleta',
  })
  @ApiResponse({ status: 200, type: WeatherInsightsDto })
  async getInsights() {
    return this.insightsService.generateInsights();
  }

  @Post('collect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Coletar dados climáticos manualmente',
    description:
      'Força uma coleta de dados climáticos da API Open-Meteo e salva no banco de dados',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados coletados com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object' },
      },
    },
  })
  async collectWeatherData() {
    return this.collectorService.collectWeatherData();
  }

  @Get('export.csv')
  @ApiOperation({ summary: 'Exportar dados climáticos em CSV' })
  async exportCsv(@Res() res: Response) {
    const logs = await this.weatherService.findAll(1, 10000);

    const csvStringifier = csvWriter.createObjectCsvStringifier({
      header: [
        { id: 'timestamp', title: 'Data/Hora' },
        { id: 'location', title: 'Localização' },
        { id: 'temperature', title: 'Temperatura (°C)' },
        { id: 'humidity', title: 'Umidade (%)' },
        { id: 'windSpeed', title: 'Velocidade do Vento (km/h)' },
        { id: 'condition', title: 'Condição' },
        { id: 'rainProbability', title: 'Probabilidade de Chuva (%)' },
      ],
    });

    const records = logs.data.map((log) => ({
      timestamp: new Date(log.timestamp).toLocaleString('pt-BR'),
      location: log.location,
      temperature: log.temperature.toFixed(2),
      humidity: log.humidity.toFixed(2),
      windSpeed: log.windSpeed.toFixed(2),
      condition: log.condition,
      rainProbability: log.rainProbability.toFixed(2),
    }));

    const csvContent =
      csvStringifier.getHeaderString() +
      csvStringifier.stringifyRecords(records);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=weather_data.csv',
    );
    res.send(csvContent);
  }

  @Get('export.xlsx')
  @ApiOperation({ summary: 'Exportar dados climáticos em XLSX' })
  async exportXlsx(@Res() res: Response) {
    const logs = await this.weatherService.findAll(1, 10000);

    const worksheetData = logs.data.map((log) => ({
      'Data/Hora': new Date(log.timestamp).toLocaleString('pt-BR'),
      Localização: log.location,
      'Temperatura (°C)': log.temperature,
      'Umidade (%)': log.humidity,
      'Velocidade do Vento (km/h)': log.windSpeed,
      Condição: log.condition,
      'Probabilidade de Chuva (%)': log.rainProbability,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados Climáticos');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=weather_data.xlsx',
    );
    res.send(buffer);
  }
}
