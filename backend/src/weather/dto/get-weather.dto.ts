import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../utils/paginated-response.dto';

export class WeatherResponseDto {
  @ApiProperty({
    description: 'Weather ID',
    example: '507f1f77bcf86cd799439011',
    type: String,
  })
  _id: string;

  @ApiProperty({ description: 'Temperature in Celsius', example: 22.5 })
  temperature: number;

  @ApiProperty({ description: 'Humidity in percentage', example: 50 })
  humidity: number;

  @ApiProperty({ description: 'Wind speed in km/h', example: 10.5 })
  wind_speed: number;

  @ApiProperty({ description: 'Weather description', example: 'sunny' })
  weather_description: string;

  @ApiProperty({ description: 'Rain probability in percentage', example: 10 })
  rain_probability: number;

  @ApiProperty({
    description: 'Fetched at (ISO string)',
    example: '2025-01-01T00:00:00Z',
  })
  fetched_at: string;
}

export class PaginatedWeatherResponseDto extends PaginatedResponseDto<WeatherResponseDto> {
  @ApiProperty({
    description: 'Array of weather records',
    type: [WeatherResponseDto],
    isArray: true,
  })
  declare data: WeatherResponseDto[];
}
