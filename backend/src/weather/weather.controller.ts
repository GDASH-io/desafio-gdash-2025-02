import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { FilterWeatherLogsDto } from './dto/filter-weather-logs.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExportService } from './export.service';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly exportService: ExportService,
  ) {}

  @Post('logs')
  @ApiOperation({ summary: 'Criar novo registro de clima (usado pelo worker Go)' })
  create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    return this.weatherService.create(createWeatherLogDto);
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar registros de clima com filtros' })
  findAll(@Query() filters: FilterWeatherLogsDto) {
    return this.weatherService.findAll(filters);
  }

  @Get('logs/latest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar último registro de clima' })
  findLatest(@Query('city') city?: string) {
    return this.weatherService.findLatest(city);
  }

  @Get('export.csv')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exportar dados climáticos em CSV' })
  async exportCsv(@Query() filters: FilterWeatherLogsDto, @Res() res: Response) {
    const data = await this.weatherService.findAll({ ...filters, limit: 10000 });
    const csv = await this.exportService.exportToCsv(data.data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=weather-data.csv');
    res.status(HttpStatus.OK).send(csv);
  }

  @Get('export.xlsx')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exportar dados climáticos em XLSX' })
  async exportXlsx(@Query() filters: FilterWeatherLogsDto, @Res() res: Response) {
    const data = await this.weatherService.findAll({ ...filters, limit: 10000 });
    const buffer = await this.exportService.exportToXlsx(data.data);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=weather-data.xlsx');
    res.status(HttpStatus.OK).send(buffer);
  }
}

