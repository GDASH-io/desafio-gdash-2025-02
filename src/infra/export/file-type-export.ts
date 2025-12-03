import { ClimateExport } from '@/domain/aplication/export/climate-export';
import { Climate } from '@/domain/enterprise/entities/climate';
import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { json2csv } from 'json-2-csv';

@Injectable()
export class FileTypeExport implements ClimateExport {
  async csvExport(climate: Climate[]): Promise<string> {
    const parser = json2csv(climate);
    return parser;
  }
  async xlsxExport(climate: Climate[]): Promise<Buffer> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Climate');
    worksheet.columns = [
      { header: 'TimeStamp', key: 'timeStamp', width: 25 },
      { header: 'Temperature (°C)', key: 'temperature', width: 15 },
      { header: 'Wind Speed (km/h)', key: 'windSpeed', width: 15 },
      { header: 'Wind Direction', key: 'windDirection', width: 20 },
      { header: 'Weather Code', key: 'weatherCode', width: 15 },
    ];
    climate.forEach((item) => {
      worksheet.addRow({
        timeStamp: item.timeStamp,
        temperature: item.temperature,
        windSpeed: item.windSpeed,
        windDirection: item.windDirection,
        weatherCode: item.weatherCode,
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
