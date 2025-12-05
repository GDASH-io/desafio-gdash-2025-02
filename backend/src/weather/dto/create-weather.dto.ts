import { IsNumber, Min, Max } from 'class-validator';

export class CreateWeatherDto {
  @IsNumber()
  temperature: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  humidity: number;

  @IsNumber()
  @Min(0)
  windSpeed: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  rainProbability: number;
}
