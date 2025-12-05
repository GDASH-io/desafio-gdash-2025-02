import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateWeatherLogDto {
  @ApiProperty({
    description: 'Timestamp UNIX da coleta.',
    example: 1764099323.0,
  })
  @IsNotEmpty()
  @IsNumber()
  timestamp: number;

  @ApiProperty({
    description: 'Localização da coleta.',
    example: 'Lat: -22.9068, Lon: -43.1729',
  })
  @IsNotEmpty()
  @IsString()
  location_name: string;

  @ApiProperty({ description: 'Temperatura em Celsius.', example: 25.5 })
  @IsNotEmpty()
  @IsNumber()
  temperature_c: number;

  @ApiProperty({ description: 'Velocidade do vento em km/h.', example: 12.3 })
  @IsNumber()
  wind_speed_kmh: number;

  @ApiProperty({ description: 'Código do clima (WMO code).', example: 3 })
  @IsNotEmpty()
  @IsNumber()
  weather_code: number;

  @ApiProperty({
    description: 'Condição do clima (texto).',
    example: 'Céu Limpo/Parcialmente Nublado',
  })
  @IsNotEmpty()
  @IsString()
  condition: string;
}

export class WeatherLogDto {
  @ApiProperty({
    description: 'ID único do log.',
    example: '65c9f91a5f60e90c885a065c',
  })
  _id: string;

  @ApiProperty({
    description: 'Timestamp UNIX da coleta.',
    example: 1764099323.0,
  })
  timestamp: number;

  @ApiProperty({
    description: 'Localização da coleta.',
    example: 'Lat: -22.9068, Lon: -43.1729',
  })
  location_name: string;

  @ApiProperty({ description: 'Temperatura em Celsius.', example: 25.5 })
  temperature_c: number;

  @ApiProperty({ description: 'Velocidade do vento em km/h.', example: 12.3 })
  wind_speed_kmh: number;

  @ApiProperty({ description: 'Código do clima (WMO code).', example: 3 })
  weather_code: number;

  @ApiProperty({
    description: 'Condição do clima (texto).',
    example: 'Céu Limpo/Parcialmente Nublado',
  })
  condition: string;

  @ApiProperty({
    description: 'Data de criação do log.',
    example: '2025-12-05T15:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização.',
    example: '2025-12-05T15:00:00.000Z',
  })
  updatedAt: Date;
}

export class PaginatedWeatherLogsDto {
  @ApiProperty({ description: 'Página atual.', example: 1 })
  pagina_atual: number;

  @ApiProperty({ description: 'Total de logs.', example: 150 })
  total_items: number;

  @ApiProperty({ description: 'Total de páginas.', example: 15 })
  total_paginas: number;

  @ApiProperty({
    type: [WeatherLogDto],
    description: 'Lista de logs climáticos.',
  })
  data: WeatherLogDto[];
}

export class DailyTemperatureDto {
  @ApiProperty({ description: 'Data (YYYY-MM-DD)', example: '2025-12-01' })
  date: string;

  @ApiProperty({ description: 'Temperatura média do dia.', example: 26.1 })
  temp: number;
}
