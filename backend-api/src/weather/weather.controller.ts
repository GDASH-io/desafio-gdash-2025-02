import { Body, Controller, Get, Post, Header, Res } from '@nestjs/common';
import { WeatherService } from '../weather/weather.service';
import { WeatherLog } from '../weather/schemas/weather-log.schema';
import * as ExcelJs from 'exceljs';
import type { Response } from 'express';

@Controller('api/weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  //endpoint para o Worker Go
  @Post('logs')
  async createlog(@Body() logData: WeatherLog) {
    console.log('Recebido log do Go Worker: ', logData);
    return this.weatherService.create(logData);
  }
  //endpoint para o Frontend
  @Get('logs')
  async findAll() {
    return this.weatherService.findAll();
  }
  //endpoint exportar csv
  @Get('export/csv')
  @Header('Conten-Type', 'text/csv')
  @Header('Content-Disposition', 'attachement; filename="weather.csv"')
  async exportCsv(): Promise<string> {
    return await this.weatherService.exportCsv();
  }
  //endpoint exportar xlsx
  @Get('export/xlsx')
  async exportToXLSX(@Res() res: Response) {
    const data = await this.weatherService.findAll();
    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('Weather_Logs');

    worksheet.addRow([
      'Cidade',
      'Temperatura',
      'Umidade',
      'Velocidade do Vento',
      'Condição',
      'Criado em',
    ]);

    data.forEach((item) => {
      worksheet.addRow([
        item.location,
        item.temperature_c,
        item.humidity_percent,
        item.wind_speed_kmh,
        item.condition,
        new Date(item.timestamp),
      ]);
    });

    worksheet.columns.forEach((col) => {
      if (!col.eachCell) return;
      let maxLength = 10;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const value = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, value.length);
      });
      col.width = maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename="weather.xlsx"');

    return res.send(buffer);
  }
}
