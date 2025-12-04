import { Controller, Post, Body, Get, Res } from '@nestjs/common';
import { WeatherLogsService } from './weather-logs.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { Response } from 'express';
import * as fastcsv from 'fast-csv';
import * as ExcelJS from 'exceljs';

@Controller('weather/logs')
export class WeatherLogsController {
  constructor(private readonly svc: WeatherLogsService) { }

  @Post()
  async create(@Body() dto: CreateWeatherLogDto) {
    const saved = await this.svc.create(dto);
    return { message: 'Log salvo', id: saved._id };
  }

  @Get()
  async findAll() {
    return this.svc.findAll();
  }

  @Get('export.csv')
  async exportCsv(@Res() res: Response) {
    const logs = await this.svc.findAll();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="weather_logs.csv"');

    const csvStream = fastcsv.format({ headers: true });
    csvStream.pipe(res);

    logs.forEach(log => {
      csvStream.write({
        city: log.city,
        datetime: log.datetime,
        temperature: log.temperature,
        wind_speed: log.wind_speed,
        condition_code: log.condition_code,
        humidity: log.humidity,
        precipitation_probability: log.precipitation_probability,
        received_at: log.received_at,
      });
    });

    csvStream.end();
  }

  @Get('export.xlsx')
  async exportXlsx(@Res() res: Response) {
    const logs = await this.svc.findAll();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Weather Logs');

    worksheet.columns = [
      { header: 'City', key: 'city', width: 20 },
      { header: 'Datetime', key: 'datetime', width: 20 },
      { header: 'Temperature', key: 'temperature', width: 15 },
      { header: 'Wind Speed', key: 'wind_speed', width: 15 },
      { header: 'Condition Code', key: 'condition_code', width: 15 },
      { header: 'Humidity', key: 'humidity', width: 15 },
      { header: 'Precipitation Probability', key: 'precipitation_probability', width: 20 },
      { header: 'Received At', key: 'received_at', width: 25 },
    ];

    logs.forEach(log => {
      worksheet.addRow({
        city: log.city,
        datetime: log.datetime,
        temperature: log.temperature,
        wind_speed: log.wind_speed,
        condition_code: log.condition_code,
        humidity: log.humidity,
        precipitation_probability: log.precipitation_probability,
        received_at: log.received_at,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=weather_logs.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }
}
