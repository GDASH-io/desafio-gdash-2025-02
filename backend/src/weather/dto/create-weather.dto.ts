export class CreateWeatherDto {
  city: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  condition: string;
  rain_probability?: number;
}
