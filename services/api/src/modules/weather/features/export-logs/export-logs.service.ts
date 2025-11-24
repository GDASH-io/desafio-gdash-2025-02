import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from '../../schemas/weather-log.schema';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExportLogsService {
  constructor(
    @InjectModel(WeatherLog.name) private weatherLogModel: Model<WeatherLog>,
  ) {}

  async exportToCSV(): Promise<Buffer> {
    const logs = await this.weatherLogModel
      .find()
      .sort({ timestamp: -1 })
      .limit(1000)
      .exec();

    const headers = [
      'Data/Hora',
      'Cidade',
      'Estado',
      'País',
      'Temperatura (°C)',
      'Sensação Térmica (°C)',
      'Umidade (%)',
      'Velocidade do Vento (km/h)',
      'Direção do Vento (°)',
      'Pressão (hPa)',
      'Índice UV',
      'Visibilidade (km)',
      'Condição',
      'Probabilidade de Chuva (%)',
      'Cobertura de Nuvens (%)',
    ];

    const rows = logs.map((log) => [
      new Date(log.timestamp).toLocaleString('pt-BR'),
      log.city,
      log.state,
      log.country,
      log.temperature,
      log.feelsLike,
      log.humidity,
      log.windSpeed,
      log.windDirection,
      log.pressure,
      log.uvIndex,
      log.visibility,
      log.condition,
      log.rainProbability,
      log.cloudCover,
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join(
      '\n',
    );

    return Buffer.from('\uFEFF' + csv, 'utf-8');
  }

  async exportToXLSX(): Promise<Buffer> {
    const logs = await this.weatherLogModel
      .find()
      .sort({ timestamp: -1 })
      .limit(1000)
      .exec();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dados Climáticos');

    worksheet.columns = [
      { header: 'Data/Hora', key: 'timestamp', width: 20 },
      { header: 'Cidade', key: 'city', width: 15 },
      { header: 'Estado', key: 'state', width: 10 },
      { header: 'País', key: 'country', width: 10 },
      { header: 'Temperatura (°C)', key: 'temperature', width: 18 },
      { header: 'Sensação Térmica (°C)', key: 'feelsLike', width: 22 },
      { header: 'Umidade (%)', key: 'humidity', width: 15 },
      { header: 'Velocidade do Vento (km/h)', key: 'windSpeed', width: 25 },
      { header: 'Direção do Vento (°)', key: 'windDirection', width: 20 },
      { header: 'Pressão (hPa)', key: 'pressure', width: 15 },
      { header: 'Índice UV', key: 'uvIndex', width: 12 },
      { header: 'Visibilidade (km)', key: 'visibility', width: 18 },
      { header: 'Condição', key: 'condition', width: 15 },
      {
        header: 'Probabilidade de Chuva (%)',
        key: 'rainProbability',
        width: 25,
      },
      { header: 'Cobertura de Nuvens (%)', key: 'cloudCover', width: 22 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    logs.forEach((log) => {
      worksheet.addRow({
        timestamp: new Date(log.timestamp).toLocaleString('pt-BR'),
        city: log.city,
        state: log.state,
        country: log.country,
        temperature: log.temperature,
        feelsLike: log.feelsLike,
        humidity: log.humidity,
        windSpeed: log.windSpeed,
        windDirection: log.windDirection,
        pressure: log.pressure,
        uvIndex: log.uvIndex,
        visibility: log.visibility,
        condition: log.condition,
        rainProbability: log.rainProbability,
        cloudCover: log.cloudCover,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
