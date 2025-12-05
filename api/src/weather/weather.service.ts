import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';
import { Model } from 'mongoose';
import {
  IAggregationResult,
  ICreateWeatherLogDto,
  IWeatherInsight,
  IPaginatedWeatherLogsResponse,
  IWeatherLog as IWeatherLogInterface,
  ILogExport,
  IDailyTemperature,
  IDailyAggregationResult,
} from 'src/weather/interfaces/weather.interface';
import { Parser } from 'json2csv';
import * as ExcelJS from 'exceljs';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLogDocument>,
  ) {}

  async CreateLog(
    createWeatherLogDto: ICreateWeatherLogDto,
  ): Promise<WeatherLog> {
    const createdLog = new this.weatherLogModel(createWeatherLogDto);
    return createdLog.save();
  }

  async findAllLogs(
    page: number = 1,
    limit: number = 1,
  ): Promise<IPaginatedWeatherLogsResponse> {
    const skip = (page - 1) * limit;
    const totalItems = await this.weatherLogModel.countDocuments().exec();
    const totalPages = Math.ceil(totalItems / limit);
    const logs = await this.weatherLogModel
      .find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean()
      .exec();

    const mappedLogs: IWeatherLogInterface[] = logs.map((log) => {
      const jsonString = JSON.stringify(log);
      return JSON.parse(jsonString) as IWeatherLogInterface;
    });

    return {
      pagina_atual: page,
      total_items: totalItems,
      total_paginas: totalPages,
      data: mappedLogs,
    };
  }

  async generateSimpleInsights(): Promise<IWeatherInsight> {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const analytics = await this.weatherLogModel
      .aggregate<IAggregationResult>([
        {
          $match: {
            createdAt: { $gte: last7Days },
          },
        },
        {
          $group: {
            _id: null,
            avgTemp: { $avg: '$temperature_c' },
            maxTemp: { $max: '$temperature_c' },
            minTemp: { $min: '$temperature_c' },
            count: { $sum: 1 },
          },
        },
      ])
      .exec();

    const data: IAggregationResult = analytics[0] || {
      _id: null,
      avgTemp: 0,
      maxTemp: 0,
      minTemp: 0,
      count: 0,
    };

    let classification: string;
    let alert: string | null = null;

    if (data.avgTemp > 30) {
      classification = 'Quente';
      alert = 'Atenção: Calor extremo persistente.';
    } else if (data.avgTemp < 15) {
      classification = 'Frio';
    } else {
      classification = 'Agradável';
    }

    return {
      period: 'Últimos 7 dias',
      average_temperature_c: parseFloat(data.avgTemp.toFixed(1)),
      max_temperature_c: data.maxTemp,
      min_temperature_c: data.minTemp,
      data_points: data.count,
      classification: classification,
      alert: alert,
      summary_text: `A temperatura média nos últimos 7 dias foi de ${parseFloat(data.avgTemp.toFixed(1))}°C. O clima está classificado como ${classification}.`,
    };
  }

  async exportToCsv(): Promise<string> {
    const logs = await this.weatherLogModel.find().lean().exec();
    if (!logs || logs.length === 0) {
      return '';
    }
    const fields = [
      { label: 'ID', value: '_id' },
      { label: 'Timestamp (UNIX)', value: 'timestamp' },
      { label: 'Localização', value: 'location_name' },
      { label: 'Temperatura (°C)', value: 'temperature_c' },
      { label: 'Velocidade do Vento (km/h)', value: 'wind_speed_kmh' },
      { label: 'Código do Clima (WMO)', value: 'weather_code' },
      { label: 'Condição', value: 'condition' },
      { label: 'Data de Criação (DB)', value: 'createdAt' },
    ];

    const json2csv = new Parser({ fields });
    try {
      const csv = json2csv.parse(logs);
      return csv;
    } catch (error) {
      console.error('Erro ao gerar CSV', error);
      throw new Error('Falha na conversão dos dados para o CSV');
    }
  }

  async exportToXlsx(): Promise<Buffer> {
    const logs = await this.weatherLogModel.find().lean().exec();

    if (!logs || logs.length === 0) {
      throw new NotFoundException(
        'Nenhum dado encontrado para exportação XLSX.',
      );
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Logs Climáticos');
    worksheet.columns = [
      { header: 'ID', key: '_id', width: 20 },
      { header: 'Timestamp (UNIX)', key: 'timestamp', width: 15 },
      { header: 'Localização', key: 'location_name', width: 25 },
      { header: 'Temperatura (°C)', key: 'temperature_c', width: 15 },
      { header: 'Vento (km/h)', key: 'wind_speed_kmh', width: 15 },
      { header: 'Código do Clima (WMO)', key: 'weather_code', width: 10 },
      { header: 'Condição', key: 'condition', width: 25 },
      {
        header: 'Data/Hora (DB)',
        key: 'createdAt',
        width: 18,
        style: { numFmt: 'yyyy-mm-dd hh:mm:ss' },
      },
    ];
    logs.forEach((log) => {
      const logData = log as unknown as ILogExport;
      worksheet.addRow({
        _id: logData._id.toString(),
        timestamp: logData.timestamp,
        location_name: logData.location_name,
        temperature_c: logData.temperature_c,
        wind_speed_kmh: logData.wind_speed_kmh,
        weather_code: logData.weather_code,
        condition: logData.condition,
        createdAt: logData.createdAt,
      });
    });
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erro ao gerar XLSX:', error.message);
      } else {
        console.error('Erro ao gerar XLSX:', error);
      }
      throw new Error('Falha na conversão dos dados para XLSX.');
    }
  }

  async getDailyTemperatures(): Promise<IDailyTemperature[]> {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyData = (await this.weatherLogModel
      .aggregate([
        {
          $match: {
            createdAt: { $gte: last7Days },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            avgTemp: { $avg: '$temperature_c' },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .exec()) as IDailyAggregationResult[];

    return dailyData.map((item) => ({
      date: item._id,
      temp: parseFloat(item.avgTemp.toFixed(1)),
    }));
  }
}
