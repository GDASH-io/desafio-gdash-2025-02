import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';

export class CreateInsightDto {
  @IsObject()
  current: any;

  @IsArray()
  forecast: any[];

  @IsOptional()
  @IsString()
  question?: string;
}
