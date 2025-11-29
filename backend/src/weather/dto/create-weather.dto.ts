import { IsString, IsNumber, IsNotEmpty, IsLatitude, IsLongitude} from 'class-validator';

export class CreateWeatherDto {
  @IsString()    
  @IsNotEmpty() 
  @IsLatitude()   
  latitude: string;

  @IsString()
  @IsNotEmpty()
  @IsLongitude()
  longitude: string;

  @IsNumber()    
  temp_c: number;

  @IsNumber()
  humidity: number;

  @IsNumber()
  wind_speed: number;

  @IsNumber()
  condition_code: number;

  @IsNumber()
  rain_prob: number;

  @IsNumber()
  collected_at: number;
}