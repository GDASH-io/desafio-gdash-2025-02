import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateWeatherDto {
  @ApiProperty({ example: -23.5505, description: 'Latitude' })
  @IsNumber()
  @IsNotEmpty()
  location_lat: number;

  @ApiProperty({ example: -46.6333, description: 'Longitude' })
  @IsNumber()
  @IsNotEmpty()
  location_lon: number;

  @ApiProperty({ example: 25.5, description: 'Temperatura em Celsius' })
  @IsNumber()
  @IsNotEmpty()
  temperature: number;

  @ApiProperty({
    example: 60,
    description: 'Umidade relativa (%)',
    required: false,
  })
  @IsNumber()
  humidity: number;

  @ApiProperty({
    example: 10.5,
    description: 'Velocidade do vento (km/h)',
    required: false,
  })
  @IsNumber()
  wind_speed: number;

  @ApiProperty({
    example: 1,
    description: 'Código WMO do clima',
    required: false,
  })
  @IsNumber()
  condition_code: number;

  @ApiProperty({
    example: '2025-11-23T10:00:00.000Z',
    description: 'Data da coleta ISO8601',
  })
  @IsString()
  collected_at: string;
}
