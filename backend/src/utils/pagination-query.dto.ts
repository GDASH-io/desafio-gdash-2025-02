import { ApiProperty } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
    default: 1,
    minimum: 1,
  })
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
    default: 10,
    minimum: 1,
  })
  itemsPerPage?: number = 10;
}
