import { Transform } from 'class-transformer';
import { IsOptional, Min } from 'class-validator';

export class ListPokemonDto {
    @Transform(({ value }) => Number(value))
    @IsOptional()
    @Min(1)
    page?: number;

    @Transform(({ value }) => Number(value))
    @IsOptional()
    @Min(1)
    limit?: number;
}
