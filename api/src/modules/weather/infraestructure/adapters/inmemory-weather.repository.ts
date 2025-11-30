import { Injectable } from '@nestjs/common';
import { Insight } from 'src/modules/ai/schemas/insigthOutputSchema';
import { formatDate } from 'src/utils/formatDate';
import { WeatherRepositoryPort } from '../../ports/weather.repository.ports';
import { WeatherDataItem, WeatherDocument } from '../schema/weather.schema';

@Injectable()
export class InMemoryWeatherRepository implements WeatherRepositoryPort {
  private weathers: WeatherDocument[] = [];

  create(createWeatherDto: WeatherDocument): Promise<void> {
    this.weathers.push(createWeatherDto);
    return Promise.resolve();
  }

  getWeathers(date?: string): Promise<WeatherDataItem[] | undefined> {
    const targetDate = date || this.getToday();
    const weather = this.weathers.find((w) => w.date === targetDate);
    return Promise.resolve(weather?.data);
  }

  getAllWeathers(limit?: number): Promise<WeatherDocument[] | undefined> {
    if (limit) {
      return Promise.resolve(this.weathers.slice(0, limit));
    }
    return Promise.resolve(this.weathers);
  }

  getWeather(date?: string): Promise<WeatherDocument | null> {
    const targetDate = date || this.getToday();
    const weather = this.weathers.find((w) => w.date === targetDate);
    return Promise.resolve(weather || null);
  }

  updateWeatherData(newItem: WeatherDataItem): Promise<void> {
    const today = this.getToday();
    const weatherIndex = this.weathers.findIndex((w) => w.date === today);

    if (weatherIndex !== -1) {
      this.weathers[weatherIndex].data.push(newItem);
    }
    return Promise.resolve();
  }

  updateInsightsAndEmbeddings(newItem: {
    insight?: Insight;
    embedding?: number[];
  }): Promise<void> {
    const today = this.getToday();
    const weatherIndex = this.weathers.findIndex((w) => w.date === today);

    if (weatherIndex !== -1) {
      if (newItem.insight) {
        this.weathers[weatherIndex].insight = newItem.insight;
      }
      if (newItem.embedding) {
        this.weathers[weatherIndex].embedding = newItem.embedding;
      }
    }
    return Promise.resolve();
  }

  clear(): void {
    this.weathers = [];
  }

  getAll(): WeatherDocument[] {
    return this.weathers;
  }

  private getToday(): string {
    return formatDate({ onlyDate: true });
  }
}
