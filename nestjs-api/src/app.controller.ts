import { Body, Controller, Get, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather, WeatherDocument } from './weather/schemas/weather.schema';

@Controller('weather')
export class AppController {
  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>,
  ) {}

  @Post()
  async create(@Body() data: any) {
    // Lógica "IA" básica exigida no teste
    let insight = 'Clima estável.';
    if (data.temperature > 30) insight = '⚠️ Calor extremo! Hidrate-se.';
    else if (data.temperature < 18)
      insight = '❄️ Temperatura baixa. Leve um casaco.';
    if (data.windspeed > 20) insight += ' Ventos fortes detectados.';

    const createdWeather = new this.weatherModel({
      temperature: data.temperature,
      windspeed: data.windspeed,
      conditionCode: data.condition_code, // Note que o python manda snake_case
      aiInsight: insight,
    });

    return createdWeather.save();
  }

  @Get()
  async findAll() {
    return this.weatherModel.find().sort({ createdAt: -1 }).limit(20).exec();
  }
}
