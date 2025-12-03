import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, Res, Header, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WeatherLog } from './schemas/weather-log.schema';

/**
 * Controller para endpoints de dados climáticos
 * Gerencia criação, listagem, exportação e insights de logs climáticos
 */
@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  @SkipThrottle() // Excluir do rate limiting - endpoint interno usado pelo collector/worker
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar um novo log climático' })
  @ApiResponse({ status: 201, description: 'Log criado com sucesso', type: WeatherLog })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    console.log('[backend][weather] POST /weather/logs - Received payload:', JSON.stringify(createWeatherLogDto, null, 2));
    return this.weatherService.create(createWeatherLogDto);
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar logs climáticos com paginação' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista paginada de logs climáticos',
    type: PaginatedResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findAll(@Query() query: PaginationQueryDto) {
    console.log('[backend][weather] GET /weather/logs - query:', JSON.stringify(query));
    return this.weatherService.findAllPaginated(query);
  }

  @Get('export.csv')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Exportar logs climáticos em formato CSV' })
  @ApiResponse({ status: 200, description: 'Arquivo CSV gerado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="weather-export.csv"')
  async exportCsv(@Res() res: Response) {
    console.log('[backend][weather] GET /weather/export.csv');
    const csv = await this.weatherService.exportCsv();
    res.send(csv);
  }

  @Get('export.xlsx')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Exportar logs climáticos em formato XLSX' })
  @ApiResponse({ status: 200, description: 'Arquivo XLSX gerado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="weather-export.xlsx"')
  async exportXlsx(@Res() res: Response) {
    console.log('[backend][weather] GET /weather/export.xlsx');
    const workbook = await this.weatherService.exportXlsx();
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  }

  @Get('insights')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obter insights e análises dos dados climáticos' })
  @ApiQuery({ name: 'city', required: false, description: 'Filtrar por cidade' })
  @ApiResponse({ status: 200, description: 'Insights gerados com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getInsights(@Query('city') city?: string) {
    console.log('[backend][weather] GET /weather/insights', city ? `- city: ${city}` : '');
    return this.weatherService.getInsights(city);
  }

  @Get('cities')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar todas as cidades que possuem dados climáticos' })
  @ApiResponse({ status: 200, description: 'Lista de cidades disponíveis' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getAvailableCities() {
    console.log('[backend][weather] GET /weather/cities');
    return this.weatherService.getAvailableCities();
  }
}

