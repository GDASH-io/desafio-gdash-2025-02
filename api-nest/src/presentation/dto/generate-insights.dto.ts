import { IsDateString, IsOptional, IsArray, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GenerateInsightsDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  types?: string[];
}

