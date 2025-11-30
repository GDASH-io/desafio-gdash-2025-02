import { Insight } from 'src/modules/ai/schemas/insigthOutputSchema';
import {
  WeatherDataItem,
  WeatherDocument,
} from '../infraestructure/schema/weather.schema';

export interface WeatherRepositoryPort {
  create(createWeatherDto: WeatherDocument): Promise<void>;
  getWeathers(date?: string): Promise<WeatherDataItem[] | undefined>;
  getAllWeathers(limit?: number): Promise<WeatherDocument[] | undefined>;
  getWeather(date?: string): Promise<WeatherDocument | null>;
  updateWeatherData(newItem: WeatherDataItem): Promise<void>;
  updateInsightsAndEmbeddings(newItem: {
    insight?: Insight;
    embedding?: number[];
  }): Promise<void>;
}
