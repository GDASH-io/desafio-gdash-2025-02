import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWeatherLogDto {
    @IsString()
    source!: string;

    @IsString()
    city!: string;

    @IsNumber()
    latitude!: number;

    @IsNumber()
    longitude!: number;

    @IsString()
    collected_at!: string;

    @IsNumber()
    temperature_c!: number;

    @IsOptional()
    @IsNumber()
    humidity_percent?: number;

    @IsOptional()
    @IsNumber()
    wind_speed_kmh?: number;

    @IsOptional()
    @IsString()
    condition?: string;

    @IsOptional()
    raw?: Record<string, any>;

    @IsOptional()
    @IsString()
    location_id?: string;
}