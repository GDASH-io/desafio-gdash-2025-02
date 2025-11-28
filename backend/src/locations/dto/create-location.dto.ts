import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateLocationDto {
    @IsString()
    name!: string;

    @IsNumber()
    latitude!: number;

    @IsNumber()
    longitude!: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    intervalMinutes?: number;

    @IsOptional()
    @IsBoolean()
    active?: boolean;
}