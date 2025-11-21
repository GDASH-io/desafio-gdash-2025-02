import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateWeatherLogsUseCase } from '../../application/usecases/weather/create-weather-logs.use-case';
import { GetWeatherLogsUseCase } from '../../application/usecases/weather/get-weather-logs.use-case';
import { GetLatestWeatherLogUseCase } from '../../application/usecases/weather/get-latest-weather-log.use-case';
import { ExportWeatherLogsUseCase } from '../../application/usecases/weather/export-weather-logs.use-case';
import { CreateWeatherLogDto } from '../dto/create-weather-log.dto';
import { GetWeatherLogsQueryDto } from '../dto/get-weather-logs-query.dto';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { Public } from '../../infra/auth/public.decorator';
import * as ExcelJS from 'exceljs';

@Controller('weather')
export class WeatherLogsController {
  constructor(
    private readonly createWeatherLogsUseCase: CreateWeatherLogsUseCase,
    private readonly getWeatherLogsUseCase: GetWeatherLogsUseCase,
    private readonly getLatestWeatherLogUseCase: GetLatestWeatherLogUseCase,
    private readonly exportWeatherLogsUseCase: ExportWeatherLogsUseCase,
  ) {}

  @Post('logs')
  @Public()
  async create(@Body() createDtos: CreateWeatherLogDto[]) {
    const result = await this.createWeatherLogsUseCase.execute(createDtos);
    return {
      message: 'Logs criados com sucesso',
      ...result,
    };
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: GetWeatherLogsQueryDto) {
    return this.getWeatherLogsUseCase.execute(query);
  }

  @Get('logs/latest')
  @UseGuards(JwtAuthGuard)
  async findLatest(@Query('city') city?: string) {
    return this.getLatestWeatherLogUseCase.execute(city);
  }

  @Get('export.csv')
  @UseGuards(JwtAuthGuard)
  async exportCsv(
    @Res() res: Response,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('city') city?: string,
  ) {
    const logs = await this.exportWeatherLogsUseCase.execute({ start, end, city });

    // Gerar CSV manualmente
    const headers = [
      'timestamp',
      'city',
      'source',
      'temperature_c',
      'relative_humidity',
      'precipitation_mm',
      'wind_speed_m_s',
      'clouds_percent',
      'weather_code',
      'estimated_irradiance_w_m2',
      'temp_effect_factor',
      'soiling_risk',
      'wind_derating_flag',
      'pv_derating_pct',
    ];

    const escapeCsv = (value: any): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [
      headers.join(','),
      ...logs.map((log: any) =>
        headers
          .map((header) => escapeCsv(log[header]))
          .join(','),
      ),
    ];

    const csvContent = csvRows.join('\n');
    const filename = `weather_logs_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(HttpStatus.OK).send(csvContent);
  }

  @Get('export.xlsx')
  @UseGuards(JwtAuthGuard)
  async exportXlsx(
    @Res() res: Response,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('city') city?: string,
  ) {
    const logs = await this.exportWeatherLogsUseCase.execute({ start, end, city });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Weather Logs');

    worksheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 20 },
      { header: 'City', key: 'city', width: 20 },
      { header: 'Source', key: 'source', width: 15 },
      { header: 'Temperature (°C)', key: 'temperature_c', width: 15 },
      { header: 'Humidity (%)', key: 'relative_humidity', width: 15 },
      { header: 'Precipitation (mm)', key: 'precipitation_mm', width: 18 },
      { header: 'Wind Speed (m/s)', key: 'wind_speed_m_s', width: 18 },
      { header: 'Clouds (%)', key: 'clouds_percent', width: 12 },
      { header: 'Weather Code', key: 'weather_code', width: 12 },
      { header: 'Irradiance (W/m²)', key: 'estimated_irradiance_w_m2', width: 18 },
      { header: 'Temp Effect', key: 'temp_effect_factor', width: 12 },
      { header: 'Soiling Risk', key: 'soiling_risk', width: 12 },
      { header: 'Wind Derating', key: 'wind_derating_flag', width: 15 },
      { header: 'PV Derating (%)', key: 'pv_derating_pct', width: 15 },
    ];

    logs.forEach((log) => {
      worksheet.addRow(log);
    });

    const filename = `weather_logs_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.status(HttpStatus.OK).end();
  }

  @Get('health')
  @Public()
  async health() {
    return { status: 'ok', service: 'weather-logs-api' };
  }
}

