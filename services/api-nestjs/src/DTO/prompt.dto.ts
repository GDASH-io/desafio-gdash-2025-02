import { IsNotEmpty, IsString, IsOptional } from 'class-validator';


export class ChatResponseDto {
    @IsNotEmpty()
    estatisticas: string;
    @IsNotEmpty()
    conforto_climatico: string;
    @IsNotEmpty()
    resumo: string;
    @IsNotEmpty()
    analise_tecnica: string;
}
