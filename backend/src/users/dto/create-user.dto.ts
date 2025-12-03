import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { IsStrongPassword } from '../../common/utils/password-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @IsStrongPassword({
    message:
      'A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial',
  })
  password: string;

  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @IsString({ message: 'Função deve ser uma string' })
  @IsOptional()
  role?: string;
}

