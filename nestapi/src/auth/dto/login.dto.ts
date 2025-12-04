import { IsEmail, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
