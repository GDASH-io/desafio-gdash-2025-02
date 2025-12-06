import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Por favor, forneça um email valido' })
  @IsNotEmpty({ message: 'O campo email não pode estar vazio' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'O campo senha não pode estar vazio.' })
  password: string;
}