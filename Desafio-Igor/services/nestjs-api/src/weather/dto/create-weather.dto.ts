import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWeatherDto {
  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'BR' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 25.5 })
  @IsNumber()
  temperature: number;

  @ApiProperty({ example: 26.0 })
  @IsNumber()
  feels_like: number;

  @ApiProperty({ example: 23.0 })
  @IsNumber()
  temp_min: number;

  @ApiProperty({ example: 28.0 })
  @IsNumber()
  temp_max: number;

  @ApiProperty({ example: 1013 })
  @IsNumber()
  pressure: number;

  @ApiProperty({ example: 65 })
  @IsNumber()
  humidity: number;

  @ApiProperty({ example: 'céu limpo' })
  @IsString()
  description: string;

  @ApiProperty({ example: 3.5 })
  @IsNumber()
  wind_speed: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  clouds: number;

  @ApiProperty({ example: '2025-11-25T12:00:00' })
  @IsString()
  timestamp: string;

  @ApiProperty({ example: '2025-11-25T09:00:00' })
  @IsString()
  collected_at: string;
}
