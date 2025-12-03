import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class LoginDto {
    @ApiProperty({
        example: 'admin@admin.com',
        description: 'Email do usuário',
    })
    @IsEmail({}, { message: 'Email inválido ' })
    email: string

    @ApiProperty({
        example: 'Admin123456',
        description: 'Senha do usuário (mínimo 6 caracteres)',
        minLength: 6,
    })
    @IsString()
    @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
    password: string;
}

export class RegisterDto {
    @ApiProperty({
        example: 'usuario@gdash.com',
        description: 'Email do novo usuário',
    })
    @IsEmail({}, { message: 'Email inválido ' })
    email: string;

    @ApiProperty({
        example: 'SenhaSegura123',
        description: 'Senha (letras maiúsculas, minúsculas e números)',
        minLength: 6,
        maxLength: 50,
    })
    @IsString()
    @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
    @MaxLength(50, { message: 'Senha deve ter no máximo 50 caracteres' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Senha deve conter letras maiúsculas, minúsculas e números',
    })
    password: string;

    @ApiProperty({
        example: 'João Silva',
        description: 'Nome completo do usuário',
        minLength: 2,
        maxLength: 100,
    })
    @IsString()
    @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
    @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
    name: string
}

export class AuthResponseDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'Token JWT para autenticação',
    })
    accessToken: string;

    @ApiProperty({
        description: 'Dados do usuário autenticado',
        type: Object,
        example: {
            id: '507f1f77bcf86cd799439011',
            email: 'admin@gdash.com',
            name: 'Administrator',
            roles: ['admin', 'user'],
        },
    })
    user: {
        id: string;
        email: string;
        name: string;
        roles: string[];
    };
}