export class CreateWeatherLogDto {
  city: string;
  datetime: string;
  temperature: number;
  wind_speed: number;
  condition_code: number;
  humidity: number;
  precipitation_probability: number;
}
