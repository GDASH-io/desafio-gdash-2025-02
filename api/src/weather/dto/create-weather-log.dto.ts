import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @IsOptional()
  city?: string;
}

class CurrentDto {
  @IsNumber()
  temperature: number;

  @IsNumber()
  humidity: number;

  @IsNumber()
  wind_speed: number;

  @IsNumber()
  weather_code: number;
}

class HourlyForecastDto {
  @IsString()
  @IsNotEmpty()
  time: string;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  humidity?: number;

  @IsOptional()
  @IsNumber()
  wind_speed?: number;

  @IsOptional()
  @IsNumber()
  precipitation_probability?: number;

  @IsOptional()
  @IsNumber()
  weather_code?: number;
}

class ForecastDto {
  @ValidateNested({ each: true })
  @Type(() => HourlyForecastDto)
  hourly: HourlyForecastDto[];
}

export class CreateWeatherLogDto {
  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsObject()
  @ValidateNested()
  @Type(() => CurrentDto)
  current: CurrentDto;

  @IsObject()
  @ValidateNested()
  @Type(() => ForecastDto)
  forecast: ForecastDto;
}
