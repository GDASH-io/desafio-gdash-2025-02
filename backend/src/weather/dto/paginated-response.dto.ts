import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Lista de itens da página atual' })
  data: T[];

  @ApiProperty({ description: 'Número da página atual', example: 1 })
  page: number;

  @ApiProperty({ description: 'Número de itens por página', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total de itens', example: 100 })
  total: number;

  @ApiProperty({ description: 'Total de páginas', example: 10 })
  totalPages: number;

  @ApiProperty({ description: 'Indica se há página anterior', example: false })
  hasPreviousPage: boolean;

  @ApiProperty({ description: 'Indica se há próxima página', example: true })
  hasNextPage: boolean;
}

