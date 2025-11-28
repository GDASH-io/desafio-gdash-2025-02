import { IsNumber, IsObject, IsString, IsOptional } from 'class-validator';

export class CreateWeatherLogDto {
  @IsObject()
  location: { lat: number; lon: number };

  @IsString()
  timestamp: string;

  @IsNumber()
  temperature: number;

  @IsNumber()
  humidity: number;

  @IsNumber()
  @IsOptional()
  radiation?: number;

  @IsNumber()
  @IsOptional()
  wind_speed?: number;

  @IsNumber()
  @IsOptional()
  weather_code?: number;
}