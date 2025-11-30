import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Insight } from 'src/modules/ai/schemas/insigthOutputSchema';
import { mongoDBConstants } from 'src/shared/constants';
import { formatDate } from 'src/utils/formatDate';
import { WeatherRepositoryPort } from '../../ports/weather.repository.ports';
import { WeatherDataItem, WeatherDocument } from '../schema/weather.schema';

@Injectable()
export class WeatherRepository implements WeatherRepositoryPort {
  constructor(
    @Inject(mongoDBConstants.models.WEATHER_MODEL)
    private readonly weatherModel: Model<WeatherDocument>,
  ) {}

  async updateInsightsAndEmbeddings(newItem: {
    insight?: Insight;
    embedding?: number[];
  }): Promise<void> {
    await this.weatherModel.findOneAndUpdate(
      {
        date: this.getToday(),
      },
      newItem,
    );
  }
  async updateWeatherData(newItem: WeatherDataItem): Promise<void> {
    await this.weatherModel.findOneAndUpdate(
      {
        date: this.getToday(),
      },
      {
        $push: {
          data: { $each: [newItem] },
        },
      },
    );
  }

  async create(createWeatherDto: WeatherDocument): Promise<void> {
    await this.weatherModel.create(createWeatherDto);
  }

  async getWeathers(date?: string): Promise<WeatherDataItem[] | undefined> {
    const weather = await this.weatherModel.findOne({
      date: date || this.getToday(),
    });

    return weather?.data;
  }

  async getAllWeathers(limit?: number): Promise<WeatherDocument[] | undefined> {
    const weather = limit
      ? (
          await this.weatherModel.find({}).limit(limit).sort({ date: -1 })
        ).reverse()
      : (await this.weatherModel.find({}).sort({ date: -1 })).reverse();

    return weather;
  }

  async getWeather(date?: string): Promise<WeatherDocument | null> {
    const weather = await this.weatherModel.findOne(
      {
        date: date || this.getToday(),
      },
      {
        data: { $slice: -1 },
      },
    );

    return weather;
  }

  private getToday(): string {
    return formatDate({ onlyDate: true });
  }
}
