import { WeatherEntity } from './weather.entity';

export interface IWeatherRepository {
  create(weather: WeatherEntity): Promise<WeatherEntity>;
  findAll(): Promise<WeatherEntity[]>;
}

export const IWeatherRepository = Symbol('IWeatherRepository');
