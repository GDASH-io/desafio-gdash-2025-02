// weather.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from './schemas/meteo-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import * as ExcelJS from 'exceljs';
import { Parser } from 'json2csv';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherModel: Model<WeatherLogDocument>,
  ) {}

  async saveLog(dto: CreateWeatherLogDto) {
    const saved = await this.weatherModel.findOneAndUpdate(
      { time: dto.time, userId: dto.userId }, // chave única (1 log por dia por usuário)
      { $set: dto },                          // sobrescreve dados do dia
      { new: true, upsert: true }             // cria se não existir
    );

    return saved;
  }


  async findAll(userId: string) {
    return this.weatherModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string, userId: string) {
    const log = await this.weatherModel.findOne({ _id: id, userId });
    if (!log) throw new NotFoundException('Log not found');
    return log;
  }

  async findCurrentWeek(userId: string) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);

    const day = startOfWeek.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return this.weatherModel
      .find({
        userId,
        time: { $gte: startOfWeek.toISOString(), $lte: endOfWeek.toISOString() },
      })
      .sort({ time: 1 })
      .exec();
  }

  async exportCsv(userId: string) {
    const logs = await this.findAll(userId);
    const parser = new Parser();
    return parser.parse(logs.map((l) => l.toObject()));
  }

  async exportCsvById(id: string, userId: string) {
    const log = await this.findById(id, userId);
    const parser = new Parser();
    return parser.parse([log.toObject()]);
  }

  async exportXlsx(userId: string) {
    const logs = await this.findAll(userId);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Weather Logs');

    if (logs.length === 0) return await workbook.xlsx.writeBuffer();

    sheet.columns = Object.keys(logs[0].toObject()).map((key) => ({
      header: key,
      key,
      width: 20,
    }));

    logs.forEach((log) => sheet.addRow(log.toObject()));
    return await workbook.xlsx.writeBuffer();
  }

  async exportXlsxById(id: string, userId: string) {
    const log = await this.findById(id, userId);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Weather Log');

    const obj = log.toObject();
    sheet.columns = Object.keys(obj).map((key) => ({
      header: key,
      key,
      width: 20,
    }));

    sheet.addRow(obj);
    return await workbook.xlsx.writeBuffer();
  }
}
