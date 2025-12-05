import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNotEmpty()
  @IsString()
  MONGODB_URI: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(32, {
    message: 'JWT_SECRET deve ter no mínimo 32 caracteres',
  })
  JWT_SECRET: string;

  @IsNotEmpty()
  @IsString()
  GEMINI_API_KEY: string;

  @IsNotEmpty()
  @IsString()
  DEFAULT_ADMIN_EMAIL: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: 'DEFAULT_ADMIN_PASSWORD deve ter no mínimo 8 caracteres',
  })
  DEFAULT_ADMIN_PASSWORD: string;

  @IsOptional()
  @IsString()
  RABBITMQ_HOST: string = 'rabbitmq';

  @IsOptional()
  @IsString()
  RABBITMQ_PORT: string = '5672';
}
