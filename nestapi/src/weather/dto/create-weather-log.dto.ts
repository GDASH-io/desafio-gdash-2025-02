import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWeatherLogDto {
  @IsString()
  @IsNotEmpty()
  time: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  userId: string;


  @Type(() => Number)
  @IsNumber()
  temperature: number;

  @Type(() => Number)
  @IsNumber()
  temp_max: number;

  @Type(() => Number)
  @IsNumber()
  temp_min: number;

  @Type(() => Number)
  @IsNumber()
  humidity: number;

  @Type(() => Number)
  @IsNumber()
  wind_speed: number;

  @Type(() => Number)
  @IsNumber()
  rain_probability: number;

  @Type(() => Number)
  @IsNumber()
  weather_code: number;

  @IsString()
  @IsNotEmpty()
  sky_condition: string;
}
