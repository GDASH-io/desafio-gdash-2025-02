import { Injectable, Logger } from '@nestjs/common';
import { Parser } from '@json2csv/plainjs';
import * as ExcelJS from 'exceljs';
import { Weather } from '../schemas/weather.schema';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  /**
   * Exporta dados para formato CSV
   */
  async exportToCSV(data: Weather[]): Promise<string> {
    this.logger.log(`📄 Exportando ${data.length} registros para CSV`);

    const fields = [
      { label: 'ID', value: '_id' },
      { label: 'Data/Hora da Coleta', value: 'collected_at' },
      { label: 'Timestamp', value: 'timestamp' },
      { label: 'Latitude', value: 'latitude' },
      { label: 'Longitude', value: 'longitude' },
      { label: 'Temperatura (°C)', value: 'temperature' },
      { label: 'Umidade (%)', value: 'humidity' },
      { label: 'Velocidade do Vento (km/h)', value: 'wind_speed' },
      { label: 'Precipitação (mm)', value: 'precipitation' },
      { label: 'Código do Clima', value: 'weather_code' },
      { label: 'Condição', value: 'condition' },
      { label: 'Criado em', value: 'createdAt' },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    this.logger.log('✅ CSV gerado com sucesso');
    return csv;
  }

  /**
   * Exporta dados para formato XLSX (Excel)
   */
  async exportToXLSX(data: Weather[]): Promise<Buffer> {
    this.logger.log(`📊 Exportando ${data.length} registros para XLSX`);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dados Climáticos');

    // Definir colunas
    worksheet.columns = [
      { header: 'ID', key: '_id', width: 25 },
      { header: 'Data/Hora da Coleta', key: 'collected_at', width: 20 },
      { header: 'Temperatura (°C)', key: 'temperature', width: 15 },
      { header: 'Umidade (%)', key: 'humidity', width: 12 },
      { header: 'Vento (km/h)', key: 'wind_speed', width: 15 },
      { header: 'Precipitação (mm)', key: 'precipitation', width: 18 },
      { header: 'Código do Clima', key: 'weather_code', width: 15 },
      { header: 'Condição', key: 'condition', width: 20 },
      { header: 'Latitude', key: 'latitude', width: 12 },
      { header: 'Longitude', key: 'longitude', width: 12 },
      { header: 'Criado em', key: 'createdAt', width: 20 },
    ];

    // Estilizar cabeçalho
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    // Adicionar dados
    data.forEach((record) => {
      worksheet.addRow({
        _id: record._id?.toString(),
        collected_at: record.collected_at,
        temperature: record.temperature,
        humidity: record.humidity,
        wind_speed: record.wind_speed,
        precipitation: record.precipitation,
        weather_code: record.weather_code,
        condition: record.condition,
        latitude: record.latitude,
        longitude: record.longitude,
        createdAt: record.createdAt,
      });
    });

    // Adicionar bordas
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Adicionar auto-filtro
    worksheet.autoFilter = {
      from: 'A1',
      to: `K${data.length + 1}`,
    };

    this.logger.log('✅ XLSX gerado com sucesso');
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Gera estatísticas avançadas para análise
   */
  generateStatistics(data: Weather[]) {
    if (data.length === 0) {
      return {
        count: 0,
        message: 'Sem dados para análise',
      };
    }

    const temperatures = data.map((d) => d.temperature).filter((t) => t !== null);
    const humidities = data.map((d) => d.humidity).filter((h) => h !== null);
    const windSpeeds = data.map((d) => d.wind_speed).filter((w) => w !== null);

    return {
      count: data.length,
      temperature: {
        avg: this.average(temperatures),
        min: Math.min(...temperatures),
        max: Math.max(...temperatures),
        median: this.median(temperatures),
      },
      humidity: {
        avg: this.average(humidities),
        min: Math.min(...humidities),
        max: Math.max(...humidities),
        median: this.median(humidities),
      },
      wind_speed: {
        avg: this.average(windSpeeds),
        min: Math.min(...windSpeeds),
        max: Math.max(...windSpeeds),
        median: this.median(windSpeeds),
      },
    };
  }

  private average(arr: number[]): number {
    return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  }

  private median(arr: number[]): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }
}
