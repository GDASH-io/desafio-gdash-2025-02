import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { type UserRole } from 'src/users/dto/user.dto';

export class LoginDto {
  @ApiProperty({
    description: 'Email único do usuário',
    example: 'novo.usuario@gdash.com',
  })
  @IsEmail({}, { message: 'O email fornecido deve ser válido.' })
  @IsNotEmpty({ message: 'O campo email é obrigatório.' })
  email: string;

  @ApiProperty({
    description: 'Senha de acesso (mínimo 6 caracteres)',
    example: 'senha@123',
  })
  @IsString({ message: 'A senha deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo senha é obrigatório.' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  password: string;
}

export class AuthUserDto {
  @ApiProperty({
    description: 'ID único do usuário',
    example: '65c9f91a5f60e90c885a065c',
  })
  sub: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'admin@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Função do usuário',
    enum: ['admin', 'user'],
    example: 'admin',
  })
  role: UserRole;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acesso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Dados básicos do usuário autenticado',
    type: AuthUserDto,
  })
  user: AuthUserDto;
}
