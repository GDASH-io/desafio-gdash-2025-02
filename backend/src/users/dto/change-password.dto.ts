import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    oldPassword!: string;

    @IsString()
    @MinLength(6)
    newPassword!: string;
}