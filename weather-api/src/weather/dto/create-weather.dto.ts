import {
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateWeatherDto {
  @IsString()
  source: string;

  @IsDateString()
  timestamp: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lon: number;

  @IsOptional()
  @IsNumber()
  temperatureC?: number;

  @IsOptional()
  @IsNumber()
  humidity?: number;

  @IsOptional()
  @IsNumber()
  pressureHpa?: number;

  @IsOptional()
  @IsNumber()
  windSpeedMs?: number;

  @IsOptional()
  @IsNumber()
  windDirection?: number;

  @IsOptional()
  @IsNumber()
  precipitation?: number;

  @IsOptional()
  @IsObject()
  raw?: Record<string, any>;
}
