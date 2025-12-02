import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as XLSX from 'xlsx';
import { format } from '@fast-csv/format';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel('Weather') private weatherModel: Model<any>,
  ) { }

  async create(data: any) {
    return await this.weatherModel.create(data);
  }

  async findAll() {
    return await this.weatherModel.find().sort({ timestamp: -1 });
  }

  async findLatest(limit = 50) {
    return this.weatherModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async exportCSV() {
    const rows = await this.findAll();

    const csvStream = format({ headers: true });
    rows.forEach(r => csvStream.write(r.toObject()));
    csvStream.end();

    return csvStream;
  }

  async exportXLSX() {
    const rows = await this.findAll();

    const plainRows = rows.map(r => ({
      'Identificação': r._id.toString(),           
      'Data e horário': r.timestamp,
      'Temperatura': r.temperature,
      'Vento': r.windspeed,
      'Umidade': r.humidity,
      'Latitude': r.latitude,
      'Longitude': r.longitude,
      'Condição': r.condition
    }));

    const ws = XLSX.utils.json_to_sheet(plainRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Weather");

    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  }

}
