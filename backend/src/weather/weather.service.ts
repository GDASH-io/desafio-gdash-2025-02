import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from './weather.schema';
import * as json2csv from 'json2csv';
import * as ExcelJS from 'exceljs';

@Injectable()
export class WeatherService {
    constructor(
        @InjectModel(WeatherLog.name) private weatherLogModel: Model<WeatherLogDocument>,
    ) { }

    async create(createWeatherLogDto: any): Promise<WeatherLog> {
        const createdLog = new this.weatherLogModel(createWeatherLogDto);
        return createdLog.save();
    }

    async findAll(): Promise<WeatherLog[]> {
        return this.weatherLogModel.find().sort({ createdAt: -1 }).exec();
    }

    async getCsv(): Promise<string> {
        const logs = await this.findAll();
        const fields = ['createdAt', 'temperature', 'humidity', 'wind_speed', 'weather_code', 'precipitation'];
        const parser = new json2csv.Parser({ fields });
        return parser.parse(logs);
    }

    async getXlsx(): Promise<any> {
        const logs = await this.findAll();
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Weather Logs');

        worksheet.columns = [
            { header: 'Date', key: 'createdAt', width: 30 },
            { header: 'Temperature', key: 'temperature', width: 15 },
            { header: 'Humidity', key: 'humidity', width: 15 },
            { header: 'Wind Speed', key: 'wind_speed', width: 15 },
            { header: 'Weather Code', key: 'weather_code', width: 15 },
            { header: 'Precipitation', key: 'precipitation', width: 15 },
        ];

        logs.forEach((log) => {
            worksheet.addRow({
                createdAt: log['createdAt'],
                temperature: log.temperature,
                humidity: log.humidity,
                wind_speed: log.wind_speed,
                weather_code: log.weather_code,
                precipitation: log.precipitation,
            });
        });

        return workbook.xlsx.writeBuffer();
    }
}
