import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum InsightContext {
  GENERAL = 'general',
  ALERTS = 'alerts',
  RECOMMENDATIONS = 'recommendations',
  TRENDS = 'trends',
}

export class GenerateInsightDto {
  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(InsightContext)
  @IsOptional()
  context?: InsightContext;

  @IsString()
  @IsOptional()
  customPrompt?: string;
}
