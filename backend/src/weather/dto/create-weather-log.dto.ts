import {
  IsString,
  IsNumber,
  IsObject,
  IsOptional,
  ValidateNested,
  IsNotEmpty,
  Min,
  Max,
  IsInt,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LocationDto {
  @ApiProperty({
    description: 'Nome da localização',
    example: 'Aracaju',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome da localização é obrigatório' })
  name: string;

  @ApiProperty({
    description: 'Latitude da localização em graus decimais',
    example: -10.9472,
    type: Number,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber({}, { message: 'Latitude deve ser um número válido' })
  @Min(-90, { message: 'Latitude deve ser >= -90' })
  @Max(90, { message: 'Latitude deve ser <= 90' })
  lat: number;

  @ApiProperty({
    description: 'Longitude da localização em graus decimais',
    example: -37.0731,
    type: Number,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber({}, { message: 'Longitude deve ser um número válido' })
  @Min(-180, { message: 'Longitude deve ser >= -180' })
  @Max(180, { message: 'Longitude deve ser <= 180' })
  lon: number;
}

export class CreateWeatherLogDto {
  @ApiProperty({
    description: 'Data e hora do registro no formato ISO8601',
    example: '2024-12-01T14:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsString({ message: 'Timestamp deve ser uma string' })
  @IsNotEmpty({ message: 'Timestamp é obrigatório' })
  @IsISO8601({}, { message: 'Timestamp deve estar no formato ISO8601' })
  timestamp: string;

  @ApiProperty({
    description: 'Dados da localização onde foi registrado o clima',
    type: LocationDto,
    example: {
      name: 'Aracaju',
      lat: -10.9472,
      lon: -37.0731,
    },
  })
  @IsObject({ message: 'Location deve ser um objeto válido' })
  @ValidateNested({ message: 'Location possui campos inválidos' })
  @Type(() => LocationDto)
  @IsNotEmpty({ message: 'Location é obrigatório' })
  location: LocationDto;

  @ApiProperty({
    description: 'Temperatura em graus Celsius',
    example: 28.5,
    type: Number,
    minimum: -100,
    maximum: 60,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Temperatura deve ser um número válido' })
  @Min(-100, { message: 'Temperatura deve ser >= -100°C' })
  @Max(60, { message: 'Temperatura deve ser <= 60°C' })
  temperature?: number | null;

  @ApiProperty({
    description: 'Umidade relativa do ar em porcentagem',
    example: 65,
    type: Number,
    minimum: 0,
    maximum: 100,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Umidade deve ser um número válido' })
  @Min(0, { message: 'Umidade deve ser >= 0%' })
  @Max(100, { message: 'Umidade deve ser <= 100%' })
  humidity?: number | null;

  @ApiProperty({
    description: 'Velocidade do vento em km/h',
    example: 12.5,
    type: Number,
    minimum: 0,
    maximum: 500,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Velocidade do vento deve ser um número válido' })
  @Min(0, { message: 'Velocidade do vento deve ser >= 0 km/h' })
  @Max(500, { message: 'Velocidade do vento deve ser <= 500 km/h' })
  windSpeed?: number | null;

  @ApiProperty({
    description: 'Código numérico da condição climática (0-99)',
    example: 80,
    type: Number,
    minimum: 0,
    maximum: 99,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt({ message: 'Weather code deve ser um número inteiro' })
  @Min(0, { message: 'Weather code deve ser >= 0' })
  @Max(99, { message: 'Weather code deve ser <= 99' })
  weatherCode?: number | null;

  @ApiProperty({
    description: 'Descrição textual da condição climática',
    example: 'Ensolarado',
    type: String,
    enum: [
      'Ensolarado',
      'Parcialmente nublado',
      'Nublado',
      'Chuvoso',
      'Tempestade',
      'Neve',
      'Neblina',
      'Garoa',
      'Limpo',
    ],
  })
  @IsString({ message: 'Condição deve ser uma string' })
  @IsNotEmpty({ message: 'Condição climática é obrigatória' })
  condition: string;

  @ApiProperty({
    description: 'Probabilidade de precipitação em porcentagem',
    example: 10,
    type: Number,
    minimum: 0,
    maximum: 100,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Probabilidade de chuva deve ser um número válido' })
  @Min(0, { message: 'Probabilidade de chuva deve ser >= 0%' })
  @Max(100, { message: 'Probabilidade de chuva deve ser <= 100%' })
  precipitationProbability?: number | null;
}
