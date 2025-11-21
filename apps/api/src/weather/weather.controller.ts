import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { Response } from 'express'

import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CreateWeatherLogDto } from './dto/create-weather-log.dto'
import { WeatherService } from './weather.service'

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  @ApiOperation({ summary: 'Create weather log (used by Go worker)' })
  create(@Body() dto: CreateWeatherLogDto) {
    return this.weatherService.create(dto)
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List weather logs (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'location', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('location') location?: string,
  ) {
    return this.weatherService.findAll(page || 1, limit || 10, startDate, endDate, location)
  }

  @Get('logs/latest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get latest weather log' })
  @ApiQuery({ name: 'location', required: false, type: String })
  getLatest(@Query('location') location?: string) {
    return this.weatherService.getLatest(location)
  }

  @Post('collect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Collect weather data for a specific location' })
  collect(
    @Body() body: { latitude: number; longitude: number; location: string },
  ) {
    return this.weatherService.collectWeather(
      body.latitude,
      body.longitude,
      body.location,
    )
  }

  @Get('logs/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get weather log by ID' })
  findOne(@Param('id') id: string) {
    return this.weatherService.findById(id)
  }

  @Get('export/csv')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export weather logs to CSV' })
  async exportCsv(@Res() res: Response) {
    const csv = await this.weatherService.exportToCsv()
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=weather-logs.csv',
    )
    res.send(csv)
  }

  @Get('export/xlsx')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export weather logs to XLSX' })
  async exportXlsx(@Res() res: Response) {
    const buffer = await this.weatherService.exportToXlsx()
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=weather-logs.xlsx',
    )
    res.send(buffer)
  }
}
