import { IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para atualização de preferência de tema do usuário
 */
export class UpdateThemeDto {
  @ApiProperty({
    description: 'Preferência de tema do usuário',
    enum: ['light', 'dark'],
    example: 'dark',
  })
  @IsNotEmpty({ message: 'O tema é obrigatório' })
  @IsIn(['light', 'dark'], { message: 'O tema deve ser "light" ou "dark"' })
  theme: 'light' | 'dark';
}

