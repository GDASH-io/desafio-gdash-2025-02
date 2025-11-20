import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWeatherLogDto {
  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsNumber()
  @IsNotEmpty()
  temperature: number;

  @IsNumber()
  @IsNotEmpty()
  windspeed: number;

  @IsNumber()
  @IsNotEmpty()
  weathercode: number;

  @IsNumber()
  @IsNotEmpty()
  is_day: number;

  @IsNumber()
  @IsOptional()
  humidity?: number;

  @IsNumber()
  @IsOptional()
  precipitation_probability?: number;
}
