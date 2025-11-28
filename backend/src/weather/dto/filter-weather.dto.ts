import { ApiProperty } from '@nestjs/swagger';

export class FilterWeatherDto {
  @ApiProperty({
    description: 'Start date for filtering (ISO string)',
    example: '2025-01-01T00:00:00Z',
    required: false,
  })
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering (ISO string)',
    example: '2025-01-31T23:59:59Z',
    required: false,
  })
  endDate?: string;
}
