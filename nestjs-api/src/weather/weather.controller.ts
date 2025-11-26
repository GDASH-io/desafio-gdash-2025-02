import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Model } from 'mongoose';
import * as XLSX from 'xlsx';
import { Weather, WeatherDocument } from './schemas/weather.schema';

@Controller('weather')
export class WeatherController {
  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>,
  ) {}

  @Post()
  async create(@Body() data: any) {
    // CORREÇÃO AQUI: Definimos que é um array de strings
    const insights: string[] = [];

    // Lógica de IA baseada em regras
    if (data.temperature >= 30)
      insights.push('☀️ Calor intenso! Hidrate-se e use protetor solar.');
    else if (data.temperature >= 25)
      insights.push('🌤️ Clima agradável, ótimo para atividades externas.');
    else if (data.temperature <= 15)
      insights.push('❄️ Temperatura baixa. Recomendado levar um casaco.');

    if (data.windspeed > 25)
      insights.push(
        '💨 Ventos fortes detectados! Cuidado com janelas e objetos soltos.',
      );

    if (data.conditionCode >= 51 && data.conditionCode <= 67)
      insights.push('☔ Probabilidade de chuva. Leve o guarda-chuva.');
    if (data.conditionCode >= 95)
      insights.push('⛈️ Alerta de tempestade! Busque abrigo.');

    const finalInsight =
      insights.length > 0
        ? insights.join(' ')
        : '☁️ Clima estável. Nenhuma recomendação especial no momento.';

    const createdWeather = new this.weatherModel({
      temperature: data.temperature,
      windspeed: data.windspeed,
      conditionCode: data.conditionCode,
      aiInsight: finalInsight,
    });

    return createdWeather.save();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll() {
    return this.weatherModel.find().sort({ createdAt: -1 }).limit(20).exec();
  }

  @Get('export/csv')
  async exportCsv(@Res() res: any) {
    const data = await this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
    let csv = 'Data,Temperatura,Vento,Insight\n';

    data.forEach((row) => {
      const date = new Date(
        row['createdAt'] as string | number | Date,
      ).toLocaleString();
      const insight = row.aiInsight.replace(/,/g, ';');
      csv += `${date},${row.temperature},${row.windspeed},${insight}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('clima.csv');
    return res.send(csv);
  }

  @Get('export/xlsx')
  async exportXlsx(@Res() res: any) {
    const data = await this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
      .exec();

    const rows = data.map((d: any) => ({
      Data: new Date(d['createdAt']).toLocaleString(),
      Temp: d.temperature,
      Vento: d.windspeed,
      Insight: d.aiInsight,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Historico');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.attachment('clima.xlsx');
    res.send(buffer);
  }
}
