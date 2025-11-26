import { Body, Controller, Get, Post, Query, Res, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import { Parser } from 'json2csv';
import * as ExcelJS from 'exceljs';
import { WeatherService } from './weather.service';
import { Weather } from './entities/weather.schema';

class CreateWeatherDto {
  temp: number;
  humidity: number;
  wind_speed: number;
  precipitation: number;
  insight: string;
  is_day: number;
  collected_at: string;
  latitude: string;
  longitude: string;
}

const EXCEL_STYLES = {
  TITLE_BG: 'FF111827', 
  HEADER_BG: 'FF10B981', 
  TEXT_WHITE: 'FFFFFFFF',
  FONT_FAMILY: 'Arial',
};

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);

  constructor(private readonly weatherService: WeatherService) {}

  @Post()
  @ApiOperation({ summary: 'Ingest weather data (Internal Use)' })
  @ApiBody({ type: CreateWeatherDto })
  @ApiResponse({ status: 201, description: 'Data successfully stored.' })
  create(@Body() data: CreateWeatherDto) {
    return this.weatherService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve weather history' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records (0 for all)' })
  @ApiQuery({ name: 'start', required: false, description: 'Start date (ISO)' })
  @ApiQuery({ name: 'end', required: false, description: 'End date (ISO)' })
  @ApiResponse({ status: 200, description: 'List of weather records', type: [Weather] })
  findAll(
    @Query('limit') limit?: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const quantity = limit !== undefined ? parseInt(limit, 10) : 100;
    return this.weatherService.findAll(quantity, start, end);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Download history as CSV' })
  async exportCsv(@Res() res: Response) {
    try {
      const data = await this.weatherService.findAll(0);
      const jsonData = JSON.parse(JSON.stringify(data));
      const fields = ['collected_at', 'temp', 'humidity', 'wind_speed', 'insight'];
      
      const parser = new Parser({ fields });
      const csv = parser.parse(jsonData);

      res.header('Content-Type', 'text/csv');
      res.attachment(`weather_history_${Date.now()}.csv`);
      return res.send(csv);
    } catch (err) {
      this.logger.error('Failed to export CSV', err);
      return res.status(500).json({ message: 'Error generating CSV', error: err });
    }
  }

  @Get('export/xlsx')
  @ApiOperation({ summary: 'Download history as Excel (XLSX)' })
  async exportXlsx(@Res() res: Response) {
    try {
      const data = await this.weatherService.findAll(0);
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('GDASH Report', {
        views: [{ showGridLines: false }]
      });

      worksheet.mergeCells('A1:E1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'CLIMATE MONITORING REPORT - GDASH';
      titleCell.font = { name: EXCEL_STYLES.FONT_FAMILY, size: 16, bold: true, color: { argb: EXCEL_STYLES.TEXT_WHITE } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_STYLES.TITLE_BG } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(1).height = 30;

      worksheet.getRow(2).values = ['Timestamp', 'Temperature (°C)', 'Humidity (%)', 'Wind Speed (km/h)', 'AI Insight / Status'];
      
      worksheet.columns = [
        { key: 'collected_at', width: 25 },
        { key: 'temp', width: 18 },
        { key: 'humidity', width: 15 },
        { key: 'wind_speed', width: 18 },
        { key: 'insight', width: 80 }, 
      ];

      const headerRow = worksheet.getRow(2);
      headerRow.height = 20;
      headerRow.eachCell((cell) => {
        cell.font = { name: EXCEL_STYLES.FONT_FAMILY, bold: true, color: { argb: EXCEL_STYLES.TEXT_WHITE } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_STYLES.HEADER_BG } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      });

      data.forEach((item) => {
        const row = worksheet.addRow({
          collected_at: new Date(item.collected_at).toLocaleString('pt-BR'),
          temp: item.temp,
          humidity: item.humidity,
          wind_speed: item.wind_speed,
          insight: item.insight || '-',
        });

        row.eachCell((cell, colNumber) => {
          cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
          
          if (colNumber === 5) {
            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        });
      });

      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment(`gdash_report_${Date.now()}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();

    } catch (err) {
      this.logger.error('Failed to export Excel', err);
      return res.status(500).json({ message: 'Error generating Excel file', error: err });
    }
  }
}