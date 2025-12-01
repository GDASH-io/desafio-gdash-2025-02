import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from './create-weather-log.dto';

export class WeatherLogResponseDto {
  @ApiProperty({
    description: 'ID único do registro no banco de dados',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Data e hora do registro',
    example: '2024-12-01T14:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Localização do registro',
    type: LocationDto,
    example: {
      name: 'Aracaju',
      lat: -10.9472,
      lon: -37.0731,
    },
  })
  location: LocationDto;

  @ApiProperty({
    description: 'Temperatura em Celsius',
    example: 28.5,
    nullable: true,
  })
  temperature: number | null;

  @ApiProperty({
    description: 'Umidade em porcentagem',
    example: 65,
    nullable: true,
  })
  humidity: number | null;

  @ApiProperty({
    description: 'Velocidade do vento em km/h',
    example: 12.5,
    nullable: true,
  })
  windSpeed: number | null;

  @ApiProperty({
    description: 'Código do tempo',
    example: 80,
    nullable: true,
  })
  weatherCode: number | null;

  @ApiProperty({
    description: 'Condição climática',
    example: 'Ensolarado',
  })
  condition: string;

  @ApiProperty({
    description: 'Probabilidade de chuva',
    example: 10,
    nullable: true,
  })
  precipitationProbability: number | null;

  @ApiProperty({
    description: 'Data de criação do registro no banco',
    example: '2024-12-01T14:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do registro',
    example: '2024-12-01T14:30:00.000Z',
  })
  updatedAt: Date;
}
