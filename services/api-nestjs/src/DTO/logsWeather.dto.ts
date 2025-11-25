import { ApiProperty } from '@nestjs/swagger';

export class logsWeatherDTO {
  @ApiProperty({ example: 37.5, description: 'Temperatura em graus Celsius' })
  temperatura: number;

  @ApiProperty({
    example: 80,
    description: 'Umidade relativa do ar em porcentagem',
  })
  umidade: number;

  @ApiProperty({ example: 15, description: 'Velocidade do vento em km/h' })
  vento: number;

  @ApiProperty({ example: 'Ensolarado', description: 'Condição climática' })
  condicao: string;

  @ApiProperty({
    example: 20,
    description: 'Probabilidade de chuva em porcentagem',
  })
  probabilidadeChuva: number;

  @ApiProperty({
    example: '2025-02-25T14:30:00Z',
    description: 'Data e hora da coleta dos dados',
  })
  data_coleta: string;
}
