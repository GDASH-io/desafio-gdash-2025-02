import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  ValidateNested,
  Min,
  Max,
  IsInt,
  IsEnum,
} from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LocationDto {
  @ApiProperty({
    example: '45',
    description: 'Latitude da cidade',
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    example: '45',
    description: 'Longitude da cidade',
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    example: 'São luís',
    description: 'Nome daidade',
  })
  @IsString()
  city: string;
}

export class CreateWeatherLogDto {
  @IsDateString()
  timestamp: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsNumber()
  temperature: number;

  @IsNumber()
  @Expose({ name: 'apparent_temperature'})
  apparentTemperature: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  humidity: number;

  @IsNumber()
  pressure: number;

  @IsNumber()
  @Min(0)
  @Expose({ name: 'wind_speed'})
  windSpeed: number;

  @IsNumber()
  @Min(0)
  @Max(360)
  @Expose({ name: 'wind_direction'})
  windDirection: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  precipitation: number

  @IsNumber()
  @Min(0)
  @Max(100)
  @Expose({ name: 'cloud_cover'})
  cloudCover: number

  @IsNumber()
  @Expose({ name: 'weather_code'})
  weatherCode: number
}

export class ListWeatherLogDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['timestamp', 'temperature', 'humidity'], {
    message: 'sortBy deve ser timestamp, temperature ou humidity',
  })
  sortBy?: string = 'timestamp';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class InsightsFiltersDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(['24h', '7d', '30d'], {
    message: 'period deve ser 24h, 7d ou 30d',
  })
  period?: string = '7d';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string
}