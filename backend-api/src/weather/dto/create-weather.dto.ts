import { IsNumber, IsObject, IsDate, IsOptional } from 'class-validator'; 
import { Expose, Type } from 'class-transformer';

export class CreateWeatherDto {
  @IsObject()
  location: { lat: number; lon: number };

  @IsNumber()
  temperature: number;

  @IsNumber()
  @Expose({ name: 'humidity' })
  humidity: number;

  @IsNumber()
  @Expose({ name: 'wind_speed' })
  windSpeed: number;

  @IsNumber()
  @Expose({ name: 'condition_code' })
  conditionCode: number;

  @IsDate()                         
  @Type(() => Date)                 
  @Expose({ name: 'collected_at' })
  collectedAt: Date;
}