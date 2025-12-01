import { ApiProperty } from '@nestjs/swagger';
import { LocationDto } from './create-weather-log.dto';

class StatisticsDto {
  @ApiProperty({
    description: 'Temperatura média calculada',
    example: 24.5,
    nullable: true,
  })
  averageTemperature: number | null;

  @ApiProperty({
    description: 'Umidade média calculada',
    example: 68.2,
    nullable: true,
  })
  averageHumidity: number | null;

  @ApiProperty({
    description: 'Velocidade média do vento',
    example: 12.3,
    nullable: true,
  })
  averageWindSpeed: number | null;

  @ApiProperty({
    description: 'Probabilidade média de precipitação',
    example: 25.5,
    nullable: true,
  })
  averagePrecipitation: number | null;

  @ApiProperty({
    description: 'Temperatura mínima registrada',
    example: 18.0,
    nullable: true,
  })
  minTemperature: number | null;

  @ApiProperty({
    description: 'Temperatura máxima registrada',
    example: 32.5,
    nullable: true,
  })
  maxTemperature: number | null;

  @ApiProperty({
    description: 'Umidade mínima registrada',
    example: 45.0,
    nullable: true,
  })
  minHumidity: number | null;

  @ApiProperty({
    description: 'Umidade máxima registrada',
    example: 90.0,
    nullable: true,
  })
  maxHumidity: number | null;

  @ApiProperty({
    description: 'Total de registros analisados',
    example: 100,
  })
  totalRecords: number;

  @ApiProperty({
    description: 'Quantidade de registros com dados válidos por campo',
    example: {
      temperature: 100,
      humidity: 100,
      windSpeed: 100,
      precipitation: 98,
    },
  })
  recordsWithData: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
  };
}

class TrendsDto {
  @ApiProperty({
    description: 'Tendência da temperatura',
    example: 'estável',
    enum: ['subindo', 'descendo', 'estável'],
  })
  temperature: string;
}

class ComfortDto {
  @ApiProperty({
    description: 'Pontuação de conforto climático (0-100)',
    example: 75,
    minimum: 0,
    maximum: 100,
  })
  score: number;

  @ApiProperty({
    description: 'Classificação textual do conforto',
    example: 'agradável',
    enum: [
      'muito agradável',
      'agradável',
      'moderado',
      'desconfortável',
      'muito desconfortável',
    ],
  })
  classification: string;
}

class LatestWeatherDto {
  @ApiProperty({ example: 25.0, nullable: true })
  temperature: number | null;

  @ApiProperty({ example: 70, nullable: true })
  humidity: number | null;

  @ApiProperty({ example: 10.0, nullable: true })
  windSpeed: number | null;

  @ApiProperty({ example: 'Ensolarado' })
  condition: string;

  @ApiProperty({ example: '2024-12-01T14:30:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 15, nullable: true })
  precipitationProbability: number | null;

  @ApiProperty({ example: 80, nullable: true })
  weatherCode: number | null;

  @ApiProperty({
    type: LocationDto,
    example: {
      name: 'Aracaju',
      lat: -10.9472,
      lon: -37.0731,
    },
  })
  location: LocationDto;
}

export class WeatherInsightsResponseDto {
  @ApiProperty({
    description: 'Resumo textual da análise climática',
    example:
      '📊 Análise climática para Aracaju\n\n🌡️ Temperatura média: 24.5°C com tendência estável\n💧 Umidade média: 68.2%\n🌬️ Velocidade média do vento: 12.3 km/h\n\n☁️ Clima classificado como: "agradável"\n\n✅ Nenhum alerta ativo\n\n📈 Análise baseada em 100 registros recentes',
  })
  summary: string;

  @ApiProperty({
    description: 'Estatísticas calculadas dos registros',
    type: StatisticsDto,
  })
  statistics: StatisticsDto;

  @ApiProperty({
    description: 'Tendências identificadas nos dados',
    type: TrendsDto,
  })
  trends: TrendsDto;

  @ApiProperty({
    description: 'Índice e classificação de conforto climático',
    type: ComfortDto,
  })
  comfort: ComfortDto;

  @ApiProperty({
    description: 'Lista de alertas meteorológicos ativos',
    example: ['☀️ Temperatura muito alta', '💧 Umidade muito alta'],
    type: [String],
  })
  alerts: string[];

  @ApiProperty({
    description: 'Condição climática mais frequente nos registros',
    example: 'Ensolarado',
    nullable: true,
  })
  mostCommonCondition: string | null;

  @ApiProperty({
    description: 'Dados do registro climático mais recente',
    type: LatestWeatherDto,
  })
  latest: LatestWeatherDto;
}
