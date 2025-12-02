import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
export class CreateUserDto {
  @ApiProperty({
    description: 'Email do usuário para login',
    example: 'admin@gdash.com',
  })
  @IsEmail({}, { message: 'O email informado é inválido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Senha de acesso (mínimo 6 caracteres)',
    example: '123456',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Nível de permissão (user ou admin)',
    example: 'user',
    required: false, // Marca como opcional na doc
    default: 'user',
  })
  @IsOptional() // Opcional na criação (assume 'user' default do Schema se não vier)
  @IsString()
  @IsIn(['user', 'admin'], { message: 'O cargo deve ser user ou admin' })
  role?: string;
}
