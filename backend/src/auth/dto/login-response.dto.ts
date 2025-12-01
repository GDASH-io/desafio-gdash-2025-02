import { ApiProperty } from '@nestjs/swagger';

export class UserDataDto {
  @ApiProperty({
    description: 'ID único do usuário',
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
    description: 'Data de criação da conta',
    example: '2024-11-15T10:30:00.000Z',
  })
  createdAt: Date;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Token JWT para autenticação',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvYW8uc2lsdmFAZXhhbXBsZS5jb20iLCJzdWIiOiI2NzVjOGE5ZjhkNGUyZjFhM2I1YzZkN2UiLCJpYXQiOjE3MzMyNDcwMDAsImV4cCI6MTczMzI1MDYwMH0.abc123xyz',
  })
  access_token: string;

  @ApiProperty({
    description: 'Dados do usuário autenticado',
    type: UserDataDto,
  })
  user: UserDataDto;

  @ApiProperty({
    description: 'Tempo de expiração do token em segundos',
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Tipo do token',
    example: 'Bearer',
  })
  tokenType: string;
}
