import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiProduces,
} from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WeatherLogResponseDto } from './dto/response-weather.log.dto';

@ApiTags('Weather')
@Controller('api/weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  @ApiOperation({
    summary: 'Criar registro climático',
    description: 'Registra novos dados climáticos no sistema',
  })
  @ApiBody({
    type: CreateWeatherLogDto,
    description: 'Dados climáticos a serem registrados',
    examples: {
      ensolarado: {
        summary: '☀️ Dia ensolarado - Aracaju',
        description: 'Exemplo de um dia típico ensolarado em Aracaju/SE',
        value: {
          timestamp: '2024-12-01T14:30:00.000Z',
          location: {
            name: 'Aracaju',
            lat: -10.9472,
            lon: -37.0731,
          },
          temperature: 32.5,
          humidity: 65,
          windSpeed: 15.3,
          weatherCode: 80,
          condition: 'Ensolarado',
          precipitationProbability: 5,
        },
      },
      chuvoso: {
        summary: '🌧️ Dia chuvoso - Aracaju',
        description: 'Exemplo de dia chuvoso com alta umidade',
        value: {
          timestamp: '2024-12-01T10:00:00.000Z',
          location: {
            name: 'Aracaju',
            lat: -10.9472,
            lon: -37.0731,
          },
          temperature: 24.0,
          humidity: 90,
          windSpeed: 22.0,
          weatherCode: 61,
          condition: 'Chuvoso',
          precipitationProbability: 85,
        },
      },
      nublado: {
        summary: '☁️ Dia nublado - Aracaju',
        description: 'Exemplo de dia parcialmente nublado',
        value: {
          timestamp: '2024-12-01T08:00:00.000Z',
          location: {
            name: 'Aracaju',
            lat: -10.9472,
            lon: -37.0731,
          },
          temperature: 27.0,
          humidity: 72,
          windSpeed: 10.5,
          weatherCode: 3,
          condition: 'Parcialmente nublado',
          precipitationProbability: 30,
        },
      },
      tempestade: {
        summary: '⛈️ Tempestade - Aracaju',
        description: 'Exemplo de condições extremas com tempestade',
        value: {
          timestamp: '2024-12-01T16:00:00.000Z',
          location: {
            name: 'Aracaju',
            lat: -10.9472,
            lon: -37.0731,
          },
          temperature: 22.5,
          humidity: 95,
          windSpeed: 45.0,
          weatherCode: 95,
          condition: 'Tempestade',
          precipitationProbability: 95,
        },
      },
      dadosNulos: {
        summary: '❌ Exemplo com dados parciais/nulos',
        description: 'Quando alguns sensores não conseguiram capturar dados',
        value: {
          timestamp: '2024-12-01T12:00:00.000Z',
          location: {
            name: 'Aracaju',
            lat: -10.9472,
            lon: -37.0731,
          },
          temperature: null,
          humidity: 68,
          windSpeed: null,
          weatherCode: null,
          condition: 'Limpo',
          precipitationProbability: 0,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Registro criado com sucesso',
    type: WeatherLogResponseDto,
    schema: {
      example: {
        _id: '675c8a9f8d4e2f1a3b5c6d7e',
        timestamp: '2024-12-01T14:30:00.000Z',
        location: {
          name: 'Aracaju',
          lat: -10.9472,
          lon: -37.0731,
        },
        temperature: 32.5,
        humidity: 65,
        windSpeed: 15.3,
        weatherCode: 80,
        condition: 'Ensolarado',
        precipitationProbability: 5,
        createdAt: '2024-12-01T14:30:15.123Z',
        updatedAt: '2024-12-01T14:30:15.123Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: ['temperature must be a number', 'humidity must be a number'],
        error: 'Bad Request',
      },
    },
  })
  create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    return this.weatherService.create(createWeatherLogDto);
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth') // Indica que precisa de autenticação
  @ApiOperation({
    summary: 'Listar registros climáticos',
    description: 'Retorna uma lista paginada de todos os registros climáticos',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Quantidade de registros a retornar',
    example: 100,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Quantidade de registros a pular (para paginação)',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros retornada com sucesso',
    type: [WeatherLogResponseDto],
    schema: {
      example: [
        {
          _id: '675c8a9f8d4e2f1a3b5c6d7e',
          timestamp: '2024-12-01T14:30:00.000Z',
          location: {
            name: 'Aracaju',
            lat: -10.9472,
            lon: -37.0731,
          },
          temperature: 32.5,
          humidity: 65,
          windSpeed: 15.3,
          weatherCode: 80,
          condition: 'Ensolarado',
          precipitationProbability: 5,
        },
        {
          _id: '675c8b2a8d4e2f1a3b5c6d7f',
          timestamp: '2024-12-01T13:00:00.000Z',
          location: {
            name: 'Aracaju',
            lat: -10.9472,
            lon: -37.0731,
          },
          temperature: 30.0,
          humidity: 70,
          windSpeed: 12.0,
          weatherCode: 3,
          condition: 'Parcialmente nublado',
          precipitationProbability: 20,
        },
        {
          _id: '675c8c5b8d4e2f1a3b5c6d80',
          timestamp: '2024-12-01T10:00:00.000Z',
          location: {
            name: 'Aracaju',
            lat: -10.9472,
            lon: -37.0731,
          },
          temperature: 24.0,
          humidity: 90,
          windSpeed: 22.0,
          weatherCode: 61,
          condition: 'Chuvoso',
          precipitationProbability: 85,
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  findAll(@Query('limit') limit?: string, @Query('skip') skip?: string) {
    return this.weatherService.findAll(
      limit ? parseInt(limit) : 100,
      skip ? parseInt(skip) : 0,
    );
  }

  @Get('insights')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter insights climáticos',
    description:
      'Retorna análises estatísticas, tendências, alertas e classificação de conforto baseados nos últimos 100 registros',
  })
  @ApiResponse({
    status: 200,
    description: 'Insights gerados com sucesso',
    schema: {
      example: {
        summary:
          '📊 Análise climática para São Paulo\n\n🌡️ Temperatura média: 24.5°C com tendência estável\n💧 Umidade média: 68.2%\n🌬️ Velocidade média do vento: 12.3 km/h\n\n☁️ Clima classificado como: "agradável"\n\n✅ Nenhum alerta ativo\n\n📈 Análise baseada em 100 registros recentes',
        statistics: {
          averageTemperature: 24.5,
          averageHumidity: 68.2,
          averageWindSpeed: 12.3,
          averagePrecipitation: 25.5,
          minTemperature: 18.0,
          maxTemperature: 32.5,
          minHumidity: 45.0,
          maxHumidity: 90.0,
          totalRecords: 100,
          recordsWithData: {
            temperature: 100,
            humidity: 100,
            windSpeed: 100,
            precipitation: 98,
          },
        },
        trends: {
          temperature: 'estável',
        },
        comfort: {
          score: 75,
          classification: 'agradável',
        },
        alerts: [],
        mostCommonCondition: 'Ensolarado',
        latest: {
          temperature: 25.0,
          humidity: 70,
          windSpeed: 10.0,
          condition: 'Ensolarado',
          timestamp: '2024-12-01T14:30:00.000Z',
          precipitationProbability: 15,
          weatherCode: 800,
          location: {
            name: 'São Paulo',
            lat: -23.5505,
            lon: -46.6333,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Dados insuficientes para gerar insights',
    schema: {
      example: {
        message: 'Dados insuficientes para gerar insights',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  getInsights() {
    return this.weatherService.getInsights();
  }

  @Get('export.csv')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Exportar dados para CSV',
    description:
      'Exporta todos os registros climáticos em formato CSV com encoding UTF-8',
  })
  @ApiProduces('text/csv')
  @ApiResponse({
    status: 200,
    description: 'Arquivo CSV gerado e enviado com sucesso',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          example:
            '"Data/Hora","Local","Latitude","Longitude","Temperatura (°C)","Umidade (%)","Velocidade do Vento (km/h)","Condição","Código do Tempo","Probabilidade de Chuva (%)"\n"01/12/2024 14:30:00","São Paulo","-23.5505","-46.6333","28.5","65","12.5","Ensolarado","800","10"',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  async exportCSV(@Res() res: Response) {
    await this.weatherService.exportToCSV(res);
  }

  @Get('export.xlsx')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Exportar dados para Excel',
    description:
      'Exporta todos os registros climáticos em formato Excel (.xlsx) com formatação condicional para temperaturas',
  })
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiResponse({
    status: 200,
    description:
      'Arquivo Excel gerado com sucesso (temperaturas >30°C em vermelho, <15°C em azul)',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  async exportXLSX(@Res() res: Response) {
    await this.weatherService.exportToXLSX(res);
  }
}
