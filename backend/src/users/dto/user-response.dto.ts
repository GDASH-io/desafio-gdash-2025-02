import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID único do usuário no banco de dados',
    example: '675c8a9f8d4e2f1a3b5c6d7e',
  })
  _id: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Status de ativação do usuário',
    example: true,
    default: true,
  })
  active: boolean;

  @ApiProperty({
    description: 'Data de criação do usuário',
    example: '2024-11-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-12-01T14:30:00.000Z',
  })
  updatedAt: Date;
}
