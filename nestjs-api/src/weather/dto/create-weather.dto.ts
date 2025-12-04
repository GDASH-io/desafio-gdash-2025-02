import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateWeatherDto {
  @IsString()
  timestamp: string;

  @IsString()
  @IsOptional()
  collected_at?: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsNumber()
  @IsOptional()
  humidity?: number;

  @IsNumber()
  @IsOptional()
  wind_speed?: number;

  @IsNumber()
  @IsOptional()
  precipitation?: number;

  @IsNumber()
  @IsOptional()
  weather_code?: number;

  @IsString()
  @IsOptional()
  condition?: string;
}
