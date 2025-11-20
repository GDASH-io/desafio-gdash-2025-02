import { IsNumber, IsObject, IsString, IsDateString } from 'class-validator';

export class CreateWeatherDto {
  @IsObject()
  location: { lat: number; lon: number };

  @IsNumber()
  temperature: number;

  @IsNumber()
  humidity: number;

  @IsNumber()
  windSpeed: number;

  @IsNumber()
  conditionCode: number;

  @IsDateString()
  collectedAt: string;
}