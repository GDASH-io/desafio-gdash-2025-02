import { WeatherLog } from '@prisma/client';
import { CreateWeatherDto } from '../dto/create-weather.dto';

export abstract class WeatherRepository {
  abstract create(data: CreateWeatherDto): Promise<WeatherLog>;
  abstract findAll(): Promise<WeatherLog[]>;
}