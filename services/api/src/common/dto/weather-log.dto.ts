import {
	IsString,
	IsNumber,
	IsOptional,
	IsDateString,
	ValidateNested,
	Min,
	Max,
	IsInt,
	IsEnum,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LocationDto {
	@ApiProperty({
		example: '45',
		description: 'Latitude da cidade',
	})
	@IsNumber()
	@Min(-90)
	@Max(90)
	latitude: number;

	@ApiProperty({
		example: '45',
		description: 'Longitude da cidade',
	})
	@IsNumber()
	@Min(-180)
	@Max(180)
	longitude: number;

	@ApiProperty({
		example: 'São luís',
		description: 'Nome da cidade',
	})
	@IsString()
	city: string;
}

export class CreateWeatherLogDto {
	@ApiProperty({
		description: 'Data e hora da coleta (ISO 8601)',
		example: '2025-12-04T10:00:00Z',
	})
	@IsDateString()
	timestamp: string;

	@ApiProperty({
		description: 'Dados de geolocalização',
		type: LocationDto,
	})
	@ValidateNested()
	@Type(() => LocationDto)
	location: LocationDto;

	@ApiProperty({
		description: 'Temperatura atual em Graus Celsius',
		example: 28.5,
	})
	@IsNumber()
	temperature: number;

	@ApiProperty({
		name: 'apparent_temperature',
		description: 'Sensação térmica em Graus Celsius',
		example: 30.2,
	})
	@IsNumber()
	@Expose({ name: 'apparent_temperature' })
	apparentTemperature: number;

	@ApiProperty({
		description: 'Umidade relativa do ar (%)',
		minimum: 0,
		maximum: 100,
		example: 65,
	})
	@IsNumber()
	@Min(0)
	@Max(100)
	humidity: number;

	@ApiProperty({
		description: 'Pressão atmosférica (hPa)',
		example: 1013.25,
	})
	@IsNumber()
	pressure: number;

	@ApiProperty({
		name: 'wind_speed',
		description: 'Velocidade do vento em km/h',
		minimum: 0,
		example: 15.4,
	})
	@IsNumber()
	@Min(0)
	@Expose({ name: 'wind_speed' })
	windSpeed: number;

	@ApiProperty({
		name: 'wind_direction',
		description: 'Direção do vento em graus (0-360)',
		minimum: 0,
		maximum: 360,
		example: 180,
	})
	@IsNumber()
	@Min(0)
	@Max(360)
	@Expose({ name: 'wind_direction' })
	windDirection: number;

	@ApiProperty({
		description: 'Probabilidade de precipitação (%)',
		minimum: 0,
		maximum: 100,
		example: 0,
	})
	@IsNumber()
	@Min(0)
	@Max(100)
	precipitation: number

	@ApiProperty({
		name: 'cloud_cover',
		description: 'Cobertura de nuvens (%)',
		minimum: 0,
		maximum: 100,
		example: 25,
	})
	@IsNumber()
	@Min(0)
	@Max(100)
	@Expose({ name: 'cloud_cover' })
	cloudCover: number

	@ApiProperty({
		name: 'weather_code',
		description: 'Código WMO do clima (0=Céu Limpo, 1=Parcialmente nublado, etc)',
		example: 1,
	})
	@IsNumber()
	@Expose({ name: 'weather_code' })
	weatherCode: number
}

export class ListWeatherLogDto {
	@IsOptional()
	@IsInt()
	@Min(1)
	@Type(() => Number)
	page?: number = 1;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(100)
	@Type(() => Number)
	limit?: number = 20;

	@IsOptional()
	@IsString()
	city?: string;

	@IsOptional()
	@IsDateString()
	startDate?: string;

	@IsOptional()
	@IsDateString()
	endDate?: string;

	@IsOptional()
	@IsEnum(['timestamp', 'temperature', 'humidity'], {
		message: 'sortBy deve ser timestamp, temperature ou humidity',
	})
	sortBy?: string = 'timestamp';

	@IsOptional()
	@IsEnum(['asc', 'desc'])
	sortOrder?: 'asc' | 'desc' = 'desc';
}

export class InsightsFiltersDto {
	@IsOptional()
	@IsString()
	city?: string;

	@IsOptional()
	@IsEnum(['24h', '7d', '30d'], {
		message: 'period deve ser 24h, 7d ou 30d',
	})
	period?: string = '7d';

	@IsOptional()
	@IsDateString()
	startDate?: string;

	@IsOptional()
	@IsDateString()
	endDate?: string
}