import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva Santos',
    type: String,
    required: false,
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsOptional()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name?: string;

  @ApiProperty({
    description: 'Email do usuário (deve ser único)',
    example: 'joao.santos@example.com',
    type: String,
    format: 'email',
    required: false,
  })
  @IsEmail({}, { message: 'Email deve ser válido' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Nova senha do usuário',
    example: 'novaSenha123',
    type: String,
    minLength: 6,
    format: 'password',
    required: false,
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsOptional()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password?: string;

  @ApiProperty({
    description: 'Status de ativação do usuário',
    example: true,
    type: Boolean,
    required: false,
    default: true,
  })
  @IsBoolean({ message: 'Active deve ser um valor booleano' })
  @IsOptional()
  active?: boolean;
}
