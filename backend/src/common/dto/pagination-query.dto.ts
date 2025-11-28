import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationQueryDto {
    @Transform(({ value }) => Number(value))
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number;

    @Transform(({ value }) => Number(value))
    @IsOptional()
    @IsInt()
    @Min(1)
    limit?: number;
}
