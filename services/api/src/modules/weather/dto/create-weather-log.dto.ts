import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateWeatherLogDto {
  @IsDateString()
  @IsNotEmpty()
  timestamp: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsNumber()
  temperature: number;

  @IsNumber()
  feelsLike: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  humidity: number;

  @IsNumber()
  @Min(0)
  windSpeed: number;

  @IsNumber()
  @Min(0)
  @Max(360)
  windDirection: number;

  @IsNumber()
  @Min(0)
  pressure: number;

  @IsNumber()
  @Min(0)
  uvIndex: number;

  @IsNumber()
  @Min(0)
  visibility: number;

  @IsString()
  @IsNotEmpty()
  condition: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  rainProbability: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  cloudCover: number;

  @IsString()
  @IsOptional()
  source?: string;
}
