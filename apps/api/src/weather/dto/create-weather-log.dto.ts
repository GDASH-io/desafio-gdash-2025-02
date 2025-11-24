import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsNumber, IsString } from 'class-validator'

export class CreateWeatherLogDto {
  @ApiProperty({ example: 25.5 })
  @IsNumber()
  temperature: number

  @ApiProperty({ example: 65 })
  @IsNumber()
  humidity: number

  @ApiProperty({ example: 12.3 })
  @IsNumber()
  windSpeed: number

  @ApiProperty({ example: 'partly_cloudy' })
  @IsString()
  condition: string

  @ApiProperty({ example: 20 })
  @IsNumber()
  rainProbability: number

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  location: string

  @ApiProperty({ example: -23.5505 })
  @IsNumber()
  latitude: number

  @ApiProperty({ example: -46.6333 })
  @IsNumber()
  longitude: number

  @ApiProperty({ example: '2025-01-15T14:00:00Z' })
  @IsDateString()
  collectedAt: string
}
