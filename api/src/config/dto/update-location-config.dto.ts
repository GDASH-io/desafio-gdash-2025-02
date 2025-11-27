import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLocationConfigDto {
  @ApiProperty({ 
    description: 'City name for weather collection',
    example: 'Campo Grande'
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ 
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'BR'
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ 
    description: 'State or region (optional)',
    example: 'SP',
    required: false
  })
  @IsOptional()
  @IsString()
  state?: string;
}