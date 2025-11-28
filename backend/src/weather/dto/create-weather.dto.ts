import { ApiProperty } from '@nestjs/swagger';

export class CreateWeatherDto {
  @ApiProperty({
    description: 'Temperature in Celsius',
    example: 22.5,
  })
  temperature: number;

  @ApiProperty({
    description: 'Humidity in percentage',
    example: 50,
  })
  humidity: number;

  @ApiProperty({
    description: 'Wind speed in km/h',
    example: 10.5,
    type: Number,
  })
  wind_speed: number;

  @ApiProperty({
    description: 'Weather description',
    example: 'overcast',
  })
  weather_description: string;

  @ApiProperty({
    description: 'Rain probability in percentage',
    example: 10,
  })
  rain_probability: number;

  @ApiProperty({
    description: 'Fetched at (ISO string)',
    example: '2025-01-01T00:00:00Z',
  })
  fetched_at: string;
}
