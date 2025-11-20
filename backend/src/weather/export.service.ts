import { Injectable } from '@nestjs/common';
import { Parser } from 'json2csv';
import * as ExcelJS from 'exceljs';
import { WeatherLog } from './schemas/weather-log.schema';

@Injectable()
export class ExportService {
  async exportToCsv(data: WeatherLog[]): Promise<string> {
    const fields = [
      'city',
      'timestamp',
      'temperatureC',
      'humidity',
      'windSpeedKmh',
      'condition',
      'rainProbability',
    ];

    const parser = new Parser({ fields });
    return parser.parse(data);
  }

  async exportToXlsx(data: WeatherLog[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Weather Data');

    // Cabeçalhos
    worksheet.columns = [
      { header: 'Cidade', key: 'city', width: 20 },
      { header: 'Data/Hora', key: 'timestamp', width: 25 },
      { header: 'Temperatura (°C)', key: 'temperatureC', width: 18 },
      { header: 'Umidade', key: 'humidity', width: 12 },
      { header: 'Velocidade do Vento (km/h)', key: 'windSpeedKmh', width: 25 },
      { header: 'Condição', key: 'condition', width: 15 },
      { header: 'Probabilidade de Chuva', key: 'rainProbability', width: 22 },
    ];

    // Dados
    data.forEach((log) => {
      worksheet.addRow({
        city: log.city,
        timestamp: log.timestamp,
        temperatureC: log.temperatureC,
        humidity: log.humidity,
        windSpeedKmh: log.windSpeedKmh,
        condition: log.condition,
        rainProbability: log.rainProbability,
      });
    });

    // Estilizar cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

