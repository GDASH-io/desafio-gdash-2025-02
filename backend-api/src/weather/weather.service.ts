import { Injectable, BadRequestException } from '@nestjs/common';
import { WeatherRepository } from './repositories/weather.repository';
import { CreateWeatherDto } from './dto/create-weather.dto';

@Injectable()
export class WeatherService {
  constructor(private readonly weatherRepository: WeatherRepository) {}

  async create(createWeatherDto: CreateWeatherDto) {
    this.validateWeatherPhysics(createWeatherDto);

    return this.weatherRepository.create(createWeatherDto);
  }

  async findAll() {
    return this.weatherRepository.findAll();
  }

  private validateWeatherPhysics(data: CreateWeatherDto) {
    if (data.humidity < 0 || data.humidity > 100) {
      throw new BadRequestException('A humidade deve estar entre 0 e 100%.');
    }

    if (data.temperature < -90 || data.temperature > 60) {
      throw new BadRequestException(`Temperatura implausível: ${data.temperature}°C. Verifique o sensor.`);
    }

    if (data.windSpeed < 0) {
      throw new BadRequestException('A velocidade do vento não pode ser negativa.');
    }

    const collectedDate = new Date(data.collectedAt);
    if (collectedDate > new Date()) {
      throw new BadRequestException('Não é possível registar dados climáticos do futuro.');
    }
  }
}