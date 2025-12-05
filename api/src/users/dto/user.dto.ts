import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsIn,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IUserPublic } from '../interface/user.interface';

export type UserRole = 'admin' | 'user';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email único do usuário',
    example: 'novo.usuario@gdash.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha de acesso (mínimo 6 caracteres)',
    example: 'senha@123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Função do usuário no sistema',
    enum: ['admin', 'user'],
    default: 'user',
  })
  @IsOptional()
  @IsString()
  @IsIn(['admin', 'user'])
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'Email único do usuário',
    example: 'novo.usuario@gdash.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Senha de acesso (mínimo 6 caracteres)',
    example: 'senha@123',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({
    description: 'Função do usuário no sistema',
    enum: ['admin', 'user'],
    default: 'user',
  })
  @IsOptional()
  @IsString()
  @IsIn(['admin', 'user'])
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UserPublicDto implements IUserPublic {
  @ApiProperty({
    description: 'ID único do usuário.',
    example: '65c9f91a5f60e90c885a065c',
  })
  _id: string;

  @ApiProperty({
    description: 'Email do usuário.',
    example: 'user.exemplo@gdash.com',
  })
  email: string;

  @ApiProperty({
    description: 'Função do usuário.',
    enum: ['admin', 'user'],
    example: 'user',
  })
  role: UserRole;

  @ApiProperty({ description: 'Status de atividade da conta.', example: true })
  is_active: boolean;

  @ApiProperty({
    description: 'Data de criação.',
    example: '2025-12-05T15:00:00.000Z',
    required: false,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Data da última atualização.',
    example: '2025-12-05T15:30:00.000Z',
    required: false,
  })
  updatedAt?: Date;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({ description: 'Página atual.', example: 1 })
  pagina_atual: number;

  @ApiProperty({ description: 'Total de usuários.', example: 50 })
  total_items: number;

  @ApiProperty({ description: 'Total de páginas.', example: 5 })
  total_paginas: number;

  @ApiProperty({ type: [UserPublicDto], description: 'Lista de usuários.' })
  data: UserPublicDto[];
}
