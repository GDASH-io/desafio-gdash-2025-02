import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  @Transform(({ value }) => value === '' ? undefined : value)
  password?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  name?: string;
}

