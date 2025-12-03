import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWeatherLogDto {
  @ApiProperty({
    description: 'Timestamp do registro climático (ISO 8601)',
    example: '2025-01-24T10:00:00Z',
  })
  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @ApiProperty({
    description: 'Temperatura em graus Celsius',
    example: 25.5,
  })
  @IsNumber()
  @IsNotEmpty()
  temperature: number;

  @ApiProperty({
    description: 'Umidade relativa em percentual',
    example: 70.0,
  })
  @IsNumber()
  @IsNotEmpty()
  humidity: number;

  @ApiPropertyOptional({
    description: 'Nome da cidade (opcional)',
    example: 'São Paulo',
  })
  @IsString()
  @IsOptional()
  city?: string;
}

