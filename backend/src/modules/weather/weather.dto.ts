import { IsString, IsNumber, IsDate, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWeatherLogDto {
  @ApiProperty({ description: 'Timestamp do registro' })
  @IsDate()
  @IsNotEmpty()
  timestamp: Date;

  @ApiProperty({ description: 'Localização' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ description: 'Latitude' })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ description: 'Longitude' })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ description: 'Temperatura em Celsius' })
  @IsNumber()
  @IsNotEmpty()
  temperature: number;

  @ApiProperty({ description: 'Umidade em porcentagem' })
  @IsNumber()
  @IsNotEmpty()
  humidity: number;

  @ApiProperty({ description: 'Velocidade do vento em km/h' })
  @IsNumber()
  @IsNotEmpty()
  windSpeed: number;

  @ApiProperty({ description: 'Condição do tempo' })
  @IsString()
  @IsNotEmpty()
  condition: string;

  @ApiProperty({ description: 'Probabilidade de chuva em porcentagem' })
  @IsNumber()
  @IsNotEmpty()
  rainProbability: number;

  @ApiPropertyOptional({ description: 'Descrição adicional' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class WeatherLogResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  location: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty()
  temperature: number;

  @ApiProperty()
  humidity: number;

  @ApiProperty()
  windSpeed: number;

  @ApiProperty()
  condition: string;

  @ApiProperty()
  rainProbability: number;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class WeatherInsightsDto {
  @ApiProperty()
  summary: string;

  @ApiProperty()
  trends: string;

  @ApiProperty()
  alerts: string[];

  @ApiProperty()
  comfortScore: number;

  @ApiProperty()
  classification: string;
}

