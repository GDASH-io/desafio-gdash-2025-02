import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateWeatherLogDto {
  @IsNotEmpty()
  @IsNumber()
  temperature: number;

  @IsNotEmpty()
  @IsNumber()
  humidity: number;

  @IsNotEmpty()
  @IsNumber()
  wind_speed: number;

  @IsNotEmpty()
  @IsString()
  timestamp: string;
}
