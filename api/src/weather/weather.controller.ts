import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Res,
  Query,
  HttpException,
} from '@nestjs/common';
import { WeatherService } from './weather.service';
import { AuthGuard } from '@nestjs/passport';
import { type ICreateWeatherLogDto } from 'src/weather/interfaces/weather.interface';
import { type Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import {
  DailyTemperatureDto,
  PaginatedWeatherLogsDto,
} from './dto/weather.dto';

interface PaginationQuery {
  page?: string;
  limit?: string;
}

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  @ApiOperation({
    summary: 'POST: Receber e salvar novo log de clima (Usado pelo Go Worker)',
  })
  @ApiResponse({ status: 201, description: 'Log salvo com sucesso.' })
  @ApiResponse({ status: 500, description: 'Falha ao salvar log no MongoDB.' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createWeatherLogDto: ICreateWeatherLogDto) {
    console.log(
      'Log de clima recebido do Go worker:',
      createWeatherLogDto.location_name,
    );
    try {
      await this.weatherService.CreateLog(createWeatherLogDto);
      return { message: "'Log de clima salvo com sucesso" };
    } catch (error) {
      console.error('Erro ao salvar log no MongoDB:', error);
      throw error;
    }
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Get('logs')
  @ApiOperation({
    summary: 'GET: Listar logs climáticos recentes com paginação',
  })
  @ApiQuery({ name: 'page', required: false, example: 1, type: Number })
  @ApiQuery({ name: 'limit', required: false, example: 10, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Retorna lista paginada de logs.',
    type: PaginatedWeatherLogsDto,
  })
  async findAllLogs(@Query() query: PaginationQuery) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    return this.weatherService.findAllLogs(page, limit);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Get('insights')
  @ApiOperation({
    summary: 'GET: Gerar e retornar insights de IA (Média, Classificação)',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna objeto de insights de clima.',
    type: Object,
  })
  async getInsights() {
    return this.weatherService.generateSimpleInsights();
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Get('export/csv')
  @ApiOperation({ summary: 'Exportar todos os logs de clima para CSV' })
  @ApiResponse({
    status: 200,
    description: 'Retorna o arquivo CSV para download.',
    content: { 'text/csv': {} },
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum dado encontrado para exportação.',
  })
  async exportCsv(@Res() res: Response): Promise<void> {
    try {
      const csvData = await this.weatherService.exportToCsv();
      if (!csvData) {
        res.status(404).send('Nenhum dado encontrato para exportação.');
        return;
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="weather_logs_${Date.now()}.csv"`,
      );
      res.status(200).send(csvData);
    } catch (error) {
      console.error('Erro na exportação do CSV', error);
      res.status(401).send('Error interno do servidor ao gerar CSV');
    }
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Get('export/xlsx')
  @ApiOperation({
    summary: 'Exportar todos os logs de clima para XLSX (Planilha Excel)',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna o arquivo XLSX para download.',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {},
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum dado encontrado para exportação.',
  })
  async exportXlsx(@Res() res: Response): Promise<void> {
    try {
      const buffer = await this.weatherService.exportToXlsx();
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="weather_logs_${Date.now()}.xlsx"`,
      );
      res.status(200).send(buffer);
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(404).send(error.message);
        return;
      }
      const errorWithStatus = error as { status?: number; message: string };
      if (errorWithStatus.status === 404) {
        res.status(404).send(errorWithStatus.message);
        return;
      }
      console.error('Erro na exportação XLSX:', error);
      res.status(500).send('Erro interno do servidor ao gerar XLSX');
    }
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Get('daily-temps')
  @ApiOperation({
    summary:
      'GET: Retornar temperaturas médias diárias para o gráfico de tendência',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de temperaturas médias diárias (últimos 7 dias).',
    type: [DailyTemperatureDto],
  })
  async getDailyTemps() {
    return this.weatherService.getDailyTemperatures();
  }
}
