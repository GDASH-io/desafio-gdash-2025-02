import { IsString, IsOptional, IsNumber, IsEnum, ValidateIf } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV?: Environment;

  @IsNumber()
  @IsOptional()
  PORT?: number;

  @IsString()
  MONGO_URI: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  FRONTEND_URL?: string;

  @IsString()
  @IsOptional()
  RABBITMQ_URL?: string;

  @IsString()
  @IsOptional()
  BACKEND_URL?: string;

  @IsString()
  @IsOptional()
  OPENWEATHER_KEY?: string;

  @IsString()
  @IsOptional()
  RAWG_KEY?: string;
}

