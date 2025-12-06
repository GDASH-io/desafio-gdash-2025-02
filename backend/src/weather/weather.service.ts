import { Injectable, Inject } from '@nestjs/common';
import { IWeatherRepository } from './domain/weather.repository.interface';
import { WeatherEntity } from './domain/weather.entity';
import { Either, right } from '../shared/core/either';

export type CreateLogResponse = Either<Error, WeatherEntity>;

@Injectable()
export class WeatherService {
  constructor(@Inject(IWeatherRepository) private weatherRepository: IWeatherRepository) {}

  async createLog(data: any): Promise<CreateLogResponse> {
    const entity = new WeatherEntity(
      data.city,
      data.temperature,
      data.humidity,
      data.windSpeed,
      data.condition,
      new Date(),
    );
    const created = await this.weatherRepository.create(entity);
    return right(created);
  }

  async getAllLogs(): Promise<WeatherEntity[]> {
    return this.weatherRepository.findAll();
  }

  async getInsights(): Promise<any> {
    const logs = await this.weatherRepository.findAll();
    if (logs.length === 0) {
      return { message: 'No data available for insights.' };
    }

    const latest = logs[0];
    const avgTemp = logs.reduce((acc, curr) => acc + curr.temperature, 0) / logs.length;

    let insight = 'Conditions are stable.';
    if (latest.temperature > 30) {
      insight = 'It is very hot! Stay hydrated.';
    } else if (latest.temperature < 15) {
      insight = 'It is cold! Wear a jacket.';
    }
    if (latest.condition.toLowerCase().includes('rain')) {
      insight += ' High chance of rain.';
    }

    return {
      latestCondition: latest.condition,
      currentTemp: latest.temperature,
      averageTemp: parseFloat(avgTemp.toFixed(1)),
      insight,
    };
  }
}
