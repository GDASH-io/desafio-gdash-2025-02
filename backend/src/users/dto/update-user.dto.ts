import { IsEmail, IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsOptional()
  email?: string;

  // Senha removida - agora é alterada separadamente via endpoint /users/:id/password

  @IsString({ message: 'Nome deve ser uma string' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Função deve ser uma string' })
  @IsOptional()
  role?: string;
}

