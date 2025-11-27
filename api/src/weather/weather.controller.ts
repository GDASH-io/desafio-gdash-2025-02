import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Response,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('weather')
@Controller('api/weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  @ApiOperation({ summary: 'Create weather log entry' })
  @ApiResponse({ status: 201, description: 'Weather log created' })
  create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    return this.weatherService.create(createWeatherLogDto);
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weather logs' })
  @ApiResponse({ status: 200, description: 'List of weather logs' })
  findAll(
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    return this.weatherService.findAll(limitNum, skipNum);
  }

  @Get('recent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent weather data' })
  @ApiResponse({ status: 200, description: 'Recent weather data' })
  getRecent(@Query('hours') hours?: string) {
    const hoursNum = hours ? parseInt(hours, 10) : 24;
    return this.weatherService.findRecent(hoursNum);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weather statistics' })
  @ApiResponse({ status: 200, description: 'Weather statistics' })
  getStatistics() {
    return this.weatherService.getStatistics();
  }

  @Get('insights')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI insights from weather data' })
  @ApiResponse({ status: 200, description: 'Weather insights and recommendations' })
  getInsights() {
    return this.weatherService.generateInsights();
  }

  @Get('export/csv')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export weather data to CSV' })
  @ApiResponse({ status: 200, description: 'CSV file download' })
  async exportCsv(@Response() res: ExpressResponse) {
    const csvData = await this.weatherService.exportToCsv();
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=weather-data.csv');
    res.send(csvData);
  }

  @Get('export/xlsx')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export weather data to XLSX' })
  @ApiResponse({ status: 200, description: 'XLSX file download' })
  async exportXlsx(@Response() res: ExpressResponse) {
    const xlsxBuffer = await this.weatherService.exportToXlsx();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=weather-data.xlsx');
    res.send(xlsxBuffer);
  }
}