import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWeatherLogDto {
  @ApiProperty({ example: 'Campo Grande' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'BR' })
  @IsString()
  country: string;

  @ApiProperty({ example: 25.5 })
  @IsNumber()
  temperature: number;

  @ApiProperty({ example: 65 })
  @IsNumber()
  humidity: number;

  @ApiProperty({ example: 12.5 })
  @IsNumber()
  windSpeed: number;

  @ApiProperty({ example: 'Clear' })
  @IsString()
  condition: string;

  @ApiProperty({ example: 'Clear sky' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1013, required: false })
  @IsOptional()
  @IsNumber()
  pressure?: number;

  @ApiProperty({ example: 10000, required: false })
  @IsOptional()
  @IsNumber()
  visibility?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  uvIndex?: number;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @IsNumber()
  cloudiness?: number;

  @ApiProperty({ example: '2023-12-01T10:00:00Z' })
  @IsString()
  timestamp: string;

  @ApiProperty({ example: '2023-12-01T06:00:00Z', required: false })
  @IsOptional()
  @IsString()
  sunrise?: string;

  @ApiProperty({ example: '2023-12-01T18:00:00Z', required: false })
  @IsOptional()
  @IsString()
  sunset?: string;
}