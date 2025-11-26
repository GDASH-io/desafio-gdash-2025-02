import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsDateString,
  ValidateNested,
  IsNotEmpty,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";

export class LocationDto {
  @ApiProperty({ example: "-5.795" })
  @IsString()
  @IsNotEmpty()
  latitude: string;

  @ApiProperty({ example: "-35.209" })
  @IsString()
  @IsNotEmpty()
  longitude: string;

  @ApiProperty({ example: "Natal" })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: "RN" })
  @IsString()
  @IsNotEmpty()
  state: string;
}

export class WeatherDto {
  @ApiProperty({ example: 25.8 })
  @IsNumber()
  @Min(-100)
  @Max(100)
  temperature: number;

  @ApiProperty({ example: "°C" })
  @IsString()
  temperature_unit: string;

  @ApiProperty({ example: 80 })
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity: number;

  @ApiProperty({ example: "%" })
  @IsString()
  humidity_unit: string;

  @ApiProperty({ example: 12.2 })
  @IsNumber()
  @Min(0)
  wind_speed: number;

  @ApiProperty({ example: "km/h" })
  @IsString()
  wind_speed_unit: string;

  @ApiProperty({ example: "Parcialmente nublado" })
  @IsString()
  @IsNotEmpty()
  condition: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  weather_code: number;

  @ApiProperty({ example: 0.0 })
  @IsNumber()
  @Min(0)
  precipitation: number;

  @ApiProperty({ example: "mm" })
  @IsString()
  precipitation_unit: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  rain_probability: number;
}

export class CreateWeatherLogDto {
  @ApiProperty({ example: "2025-11-25T22:11:09.132188Z" })
  @IsDateString()
  timestamp: string;

  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ type: WeatherDto })
  @ValidateNested()
  @Type(() => WeatherDto)
  weather: WeatherDto;
}
