import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Weather, WeatherDocument } from './schemas/weather.schema';
import { Model, FilterQuery } from 'mongoose';
import { PaginatedResponseDto } from '../utils/paginated-response.dto';
import { FilterWeatherDto } from './dto/filter-weather.dto';
import { translateWeatherDescription } from '../utils/translate-weather-description';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>,
  ) {}

  async createWeather(
    weather: Omit<Weather, 'fetched_at'> & { fetched_at: Date | string },
  ): Promise<WeatherDocument> {
    const fetchedAtString: string =
      typeof weather.fetched_at === 'string'
        ? weather.fetched_at
        : weather.fetched_at.toISOString();

    const weatherData: Weather = {
      ...weather,
      weather_description: translateWeatherDescription(
        weather.weather_description,
      ),
      fetched_at: fetchedAtString,
    };
    const newWeather = new this.weatherModel(weatherData);
    return newWeather.save();
  }

  async getWeatherPaginated(
    page: number = 1,
    itemsPerPage: number = 10,
    filters?: FilterWeatherDto,
  ): Promise<PaginatedResponseDto<WeatherDocument>> {
    const skip = (page - 1) * itemsPerPage;
    const query: FilterQuery<WeatherDocument> = {};

    if (filters) {
      if (filters.startDate || filters.endDate) {
        query.fetched_at = {};
        if (filters.startDate) {
          query.fetched_at.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.fetched_at.$lte = filters.endDate;
        }
      }
    }

    const [data, totalItems] = await Promise.all([
      this.weatherModel
        .find(query)
        .sort({ fetched_at: -1 })
        .skip(skip)
        .limit(itemsPerPage)
        .lean()
        .exec(),
      this.weatherModel.countDocuments(query).exec(),
    ]);

    const translatedData = data.map((item) => ({
      ...item,
      weather_description: translateWeatherDescription(
        item.weather_description,
      ),
    })) as WeatherDocument[];

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return {
      data: translatedData,
      page,
      itemsPerPage,
      totalPages,
      totalItems,
    };
  }

  async deleteWeather(id: string): Promise<WeatherDocument | null> {
    return this.weatherModel.findByIdAndDelete(id).exec();
  }
}
