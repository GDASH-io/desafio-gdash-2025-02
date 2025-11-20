import { Injectable } from '@nestjs/common';
import { WeatherRepository } from './repositories/weather.repository';
import { CreateWeatherDto } from './dto/create-weather.dto';

@Injectable()
export class WeatherService {
  constructor(private readonly weatherRepository: WeatherRepository) {}

  async create(createWeatherDto: CreateWeatherDto) {
    return this.weatherRepository.create(createWeatherDto);
  }

  async findAll() {
    return this.weatherRepository.findAll();
  }
}