import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class logsWeatherDTO {
  @ApiProperty({ example: 37.5, description: 'Temperatura em graus Celsius' })
  @IsNumber()
  @IsNotEmpty()
  temperatura: number;

  @ApiProperty({
    example: 80,
    description: 'Umidade relativa do ar em porcentagem',
  })
  @IsNumber()
  @IsNotEmpty()
  umidade: number;

  @ApiProperty({ example: 15, description: 'Velocidade do vento em km/h' })
  @IsNumber()
  @IsNotEmpty()
  vento: number;

  @ApiProperty({ example: 'Ensolarado', description: 'Condição climática' })
  @IsString()
  @IsNotEmpty()
  condicao: string;

  @ApiProperty({
    example: 20,
    description: 'Probabilidade de chuva em porcentagem',
  })
  @IsNumber()
  @IsNotEmpty()
  probabilidade_chuva: number;

  @ApiProperty({
    example: '2025-02-25T14:30:00Z',
    description: 'Data e hora da coleta dos dados',
  })
  @IsString()
  @IsNotEmpty()
  data_coleta: string;

  @ApiProperty({
    example: 'Teresina',
    description: 'cidade onde os dados foram coletados',
  })
  @IsString()
  @IsNotEmpty()
  cidade: string;
}
