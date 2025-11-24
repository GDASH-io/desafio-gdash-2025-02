import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateWeatherLogDto {
  @IsDateString()
  @IsNotEmpty()
  timestamp: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @Type(() => Number)
  @IsNumber()
  temperature: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity: number;

  @Type(() => Number)
  @IsNumber()
  windSpeed: number;

  @IsString()
  @IsNotEmpty()
  weatherCondition: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  rainProbability?: number;

  @IsOptional()
  @IsString()
  source?: string;
}
