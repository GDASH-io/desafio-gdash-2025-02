import { IsNotEmpty, IsString, IsOptional } from 'class-validator';


export class ChatResponseDto {
    @IsNotEmpty()
    response: string;
    @IsNotEmpty()
    sessionId: string;
}
