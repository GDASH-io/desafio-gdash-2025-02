import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';

export class CreateWeatherLogDto {
  @IsDateString()
  timestamp: string;

  @IsString()
  city: string;

  @IsString()
  source: string;

  @IsNumber()
  temperature_c: number;

  @IsNumber()
  relative_humidity: number;

  @IsNumber()
  @IsOptional()
  precipitation_mm?: number;

  @IsNumber()
  wind_speed_m_s: number;

  @IsNumber()
  clouds_percent: number;

  @IsNumber()
  weather_code: number;

  @IsNumber()
  @IsOptional()
  estimated_irradiance_w_m2?: number;

  @IsNumber()
  @IsOptional()
  temp_effect_factor?: number;

  @IsEnum(['low', 'medium', 'high'])
  @IsOptional()
  soiling_risk?: string;

  @IsBoolean()
  @IsOptional()
  wind_derating_flag?: boolean;

  @IsNumber()
  @IsOptional()
  pv_derating_pct?: number;
}

