import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsArray, IsBoolean, IsEmail, IsInt, IsNumber, IsOptional, IsString, MaxLength, MinLength
} from "class-validator";


export class CreateUserDto {
    @ApiProperty({
        example: 'admin@admin.com',
        description: 'Email do usuário',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'Admin123456',
        description: 'Senha do usuário (mínimo 6 caracteres)',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    password: string;

    @ApiProperty({
        example: 'João Silva',
        description: 'Nome completo do usuário',
        minLength: 2,
        maxLength: 100,
    })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;


    @ApiProperty({
        example: 'admin',
        description: 'Cargo do usuário',
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    roles?: string[];
}

export class UpdateUserDto {
    @ApiProperty({
        example: 'João Silva',
        description: 'Nome completo do usuário',
        minLength: 2,
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name?: string;

    @ApiProperty({
        example: 'Admin123456',
        description: 'Senha do usuário (mínimo 6 caracteres)',
        minLength: 6,
    })
    @IsOptional()
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    password?: string;

    @ApiProperty({
        example: 'true',
        description: 'Usuário ativo',
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({
        example: 'admin',
        description: 'Cargo do usuário',
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    roles?: string[];
}

export class UserResponseDto {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    roles: string[];
    createdAt: Date;
    updatedAt: Date;
}