import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class UpdateCollectorConfigDto {
    @Type(() => Number)
    @IsNumber()
    @Min(1, { message: 'collectIntervalMinutes deve ser maior que 0 (em minutos)' })
    collectIntervalMinutes!: number;
}