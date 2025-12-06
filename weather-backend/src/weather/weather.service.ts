import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather, WeatherDocument } from 'src/schemas/weather.schema';
import { Ollama } from 'ollama';

@Injectable()
export class WeatherService {
  private ollama: Ollama;
  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>,
  ) {
    this.ollama = new Ollama({
      host: process.env.OLLAMA_API_URL as string,
    });
  }

  async create(weatherData: Partial<Weather>): Promise<Weather> {
    const createdWeather = new this.weatherModel(weatherData);
    return createdWeather.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 50,
    city?: string,
  ): Promise<{
    data: Weather[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const filter = city ? { city: new RegExp(city, 'i') } : {};

    const [data, total] = await Promise.all([
      this.weatherModel
        .find(filter)
        .sort({ collection_time: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.weatherModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findLatest(city?: string): Promise<Weather | null> {
    const filter = city ? { city: new RegExp(city, 'i') } : {};
    return this.weatherModel
      .findOne(filter)
      .sort({ collection_time: -1 })
      .exec();
  }

  async findByDateRange(
    startDate: number,
    endDate: number,
    city?: string,
  ): Promise<Weather[]> {
    const filter = city
      ? {
          city: new RegExp(city, 'i'),
          collection_time: { $gte: startDate, $lte: endDate },
        }
      : { collection_time: { $gte: startDate, $lte: endDate } };

    return this.weatherModel.find(filter).sort({ collection_time: 1 }).exec();
  }

  async getCities(): Promise<string[]> {
    return this.weatherModel.distinct('city').exec();
  }

  async comfortScore(city?: string): Promise<number | null> {
    const filter = city ? { city: new RegExp(city, 'i') } : {};
    const weatherData = await this.weatherModel
      .findOne(filter)
      .sort({ collection_time: -1 })
      .exec();

    if (!weatherData) return null;
    const score = await this.getComfortScore(weatherData);
    return score;
  }

  private async getComfortScore(weather: Weather): Promise<number> {
    const prompt = `Based on temperature: ${weather.temperature}°C, humidity: ${weather.humidity}%, and wind speed: ${weather.wind_speed} km/h, location: ${weather.city},calculate a comfort score from 0 to 100. Return ONLY the numeric score, no text, no explanations, just the number.`;

    try {
      const response = await this.ollama.chat({
        model: 'gemma3:latest',
        messages: [{ role: 'user', content: prompt }],
      });
      console.log('Ollama response:', response);
      return parseInt(response.message.content.trim(), 10);
    } catch (error) {
      console.error('Error calculating comfort score:', error);
      return 0;
    }
  }
}
