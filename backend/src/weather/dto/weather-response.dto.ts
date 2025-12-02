import { ApiProperty } from '@nestjs/swagger';
import { Weather } from '../entities/weather.entity';

export class WeatherResponseDto {
  @ApiProperty({ type: [Weather] })
  data: Weather[];

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  last_page: number;
}
