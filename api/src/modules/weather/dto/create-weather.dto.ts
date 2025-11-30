import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

class CurrentUnits {
  @IsString()
  time: string;

  @IsString()
  interval: string;

  @IsString()
  temperature_2m: string;

  @IsString()
  relative_humidity_2m: string;

  @IsString()
  precipitation_probability: string;

  @IsString()
  precipitation: string;

  @IsString()
  rain: string;

  @IsString()
  weather_code: string;

  @IsString()
  pressure_msl: string;

  @IsString()
  cloud_cover: string;

  @IsString()
  visibility: string;

  @IsString()
  evapotranspiration: string;

  @IsString()
  et0_fao_evapotranspiration: string;

  @IsString()
  wind_speed_10m: string;

  @IsString()
  wind_speed_80m: string;

  @IsString()
  wind_speed_120m: string;

  @IsString()
  wind_direction_10m: string;

  @IsString()
  wind_direction_80m: string;

  @IsString()
  wind_direction_120m: string;

  @IsString()
  wind_speed_180m: string;

  @IsString()
  wind_direction_180m: string;

  @IsString()
  wind_gusts_10m: string;

  @IsString()
  temperature_80m: string;

  @IsString()
  temperature_120m: string;

  @IsString()
  temperature_180m: string;

  @IsString()
  is_day: string;

  @IsString()
  uv_index: string;

  @IsString()
  uv_index_clear_sky: string;

  @IsString()
  direct_radiation: string;
}

class CurrentValues {
  @IsString()
  time: string;

  @IsNumber()
  interval: number;

  @IsNumber()
  temperature_2m: number;

  @IsNumber()
  relative_humidity_2m: number;

  @IsNumber()
  precipitation_probability: number;

  @IsNumber()
  precipitation: number;

  @IsNumber()
  rain: number;

  @IsNumber()
  weather_code: number;

  @IsNumber()
  pressure_msl: number;

  @IsNumber()
  cloud_cover: number;

  @IsNumber()
  visibility: number;

  @IsNumber()
  evapotranspiration: number;

  @IsNumber()
  et0_fao_evapotranspiration: number;

  @IsNumber()
  wind_speed_10m: number;

  @IsNumber()
  wind_speed_80m: number;

  @IsNumber()
  wind_speed_120m: number;

  @IsNumber()
  wind_direction_10m: number;

  @IsNumber()
  wind_direction_80m: number;

  @IsNumber()
  wind_direction_120m: number;

  @IsNumber()
  wind_speed_180m: number;

  @IsNumber()
  wind_direction_180m: number;

  @IsNumber()
  wind_gusts_10m: number;

  @IsNumber()
  temperature_80m: number;

  @IsNumber()
  temperature_120m: number;

  @IsNumber()
  temperature_180m: number;

  @IsNumber()
  is_day: number;

  @IsNumber()
  uv_index: number;

  @IsNumber()
  uv_index_clear_sky: number;

  @IsNumber()
  direct_radiation: number;
}

export class CreateWeatherDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  generationtime_ms: number;

  @IsNumber()
  utc_offset_seconds: number;

  @IsString()
  timezone: string;

  @IsString()
  timezone_abbreviation: string;

  @IsNumber()
  elevation: number;

  @Type(() => CurrentUnits)
  current_units: CurrentUnits;

  @Type(() => CurrentValues)
  current: CurrentValues;
}
