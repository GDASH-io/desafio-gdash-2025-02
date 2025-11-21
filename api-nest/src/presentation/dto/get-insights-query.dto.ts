import { IsOptional, IsDateString, IsArray, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetInsightsQueryDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      return value.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
    }
    if (Array.isArray(value)) {
      return value;
    }
    return undefined;
  })
  @IsArray()
  @IsString({ each: true })
  types?: string[];
}

