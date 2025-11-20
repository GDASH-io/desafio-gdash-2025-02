import { IsString, IsNumber, IsDate, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateWeatherLogDto {
  @ApiProperty({ example: 'Maceió' })
  @IsString()
  city: string;

  @ApiProperty({ example: '2025-01-19T12:00:00Z' })
  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @ApiProperty({ example: 29.3 })
  @IsNumber()
  temperatureC: number;

  @ApiProperty({ example: 0.78 })
  @IsNumber()
  humidity: number;

  @ApiProperty({ example: 14.2 })
  @IsNumber()
  windSpeedKmh: number;

  @ApiProperty({ example: 'cloudy' })
  @IsString()
  condition: string;

  @ApiProperty({ example: 0.4 })
  @IsNumber()
  rainProbability: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  raw?: any;
}

