import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { AdvancedInsightsService, AdvancedInsight } from './advanced-insights.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly advancedInsightsService: AdvancedInsightsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create weather record' })
  create(@Body() createWeatherDto: CreateWeatherDto) {
    return this.weatherService.create(createWeatherDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all weather records' })
  findAll(@Query('limit') limit?: number, @Query('city') city?: string) {
    return this.weatherService.findAll(limit, city);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weather statistics' })
  getStatistics() {
    return this.weatherService.getStatistics();
  }

  @Get('insights')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate AI insights (basic)' })
  generateInsights() {
    return this.weatherService.generateInsights();
  }

  @Get('insights/advanced')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate advanced AI insights with vector store' })
  async generateAdvancedInsights(@Query('limit') limit?: number): Promise<AdvancedInsight> {
    const weatherData = await this.weatherService.findAll(limit || 10);
    return this.advancedInsightsService.generateAdvancedInsights(weatherData);
  }

  @Get('export/csv')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export data as CSV' })
  async exportCSV(@Res() res: Response) {
    const csv = await this.weatherService.exportToCSV();
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=weather-data.csv');
    res.send(csv);
  }

  @Get('export/xlsx')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export data as Excel' })
  async exportExcel(@Res() res: Response) {
    const buffer = await this.weatherService.exportToExcel();
    res.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.header('Content-Disposition', 'attachment; filename=weather-data.xlsx');
    res.send(buffer);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weather by ID' })
  findOne(@Param('id') id: string) {
    return this.weatherService.findById(id);
  }
}
