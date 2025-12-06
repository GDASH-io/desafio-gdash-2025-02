import { WeatherEntity } from './weather.entity';

export class WeatherMapper {
  static toResponse(weather: WeatherEntity) {
    return {
      id: weather.id,
      city: weather.city,
      temperature: weather.temperature,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      condition: weather.condition,
      timestamp: weather.timestamp.getTime() / 1000, // Return unix timestamp for frontend compatibility
    };
  }

  static toResponseList(weathers: WeatherEntity[]) {
    return weathers.map(w => this.toResponse(w));
  }
}
