import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { WeatherService } from './weather.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { createWeatherSchema } from './validation/create-weather.schema';
import { z } from 'zod';
import {
  WeatherResponseDto,
  PaginatedWeatherResponseDto,
} from './dto/get-weather.dto';
import { PaginationQueryDto } from '../utils/pagination-query.dto';
import { FilterWeatherDto } from './dto/filter-weather.dto';
import { json2csv } from 'json-2-csv';
import jsonAsXlsx from 'json-as-xlsx';
import { translateWeatherDescription } from '../utils/translate-weather-description';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @ApiExcludeEndpoint()
  @Post('internal')
  @UseGuards(ApiKeyGuard)
  async createWeatherInternal(@Body() weatherData: CreateWeatherDto) {
    const result = createWeatherSchema.safeParse(weatherData);

    if (!result.success) {
      throw new BadRequestException(z.treeifyError(result.error));
    }

    return this.weatherService.createWeather(weatherData);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new weather record' })
  @ApiResponse({
    status: 201,
    description: 'Weather record successfully created',
    type: WeatherResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or weather already exists',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createWeather(@Body() weatherData: CreateWeatherDto) {
    const result = createWeatherSchema.safeParse(weatherData);

    if (!result.success) {
      throw new BadRequestException(z.treeifyError(result.error));
    }

    return this.weatherService.createWeather(weatherData);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all weather records with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Weather records successfully retrieved',
    type: PaginatedWeatherResponseDto,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'itemsPerPage',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date (ISO string)',
  })
  async getWeather(
    @Query() paginationQuery: PaginationQueryDto,
    @Query() filterQuery: FilterWeatherDto,
  ) {
    const page =
      paginationQuery.page !== undefined ? Number(paginationQuery.page) : 1;
    const itemsPerPage =
      paginationQuery.itemsPerPage !== undefined
        ? Number(paginationQuery.itemsPerPage)
        : 10;

    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }

    if (itemsPerPage < 1) {
      throw new BadRequestException('ItemsPerPage must be greater than 0');
    }

    const filters: FilterWeatherDto = {};
    if (filterQuery.startDate) filters.startDate = filterQuery.startDate;
    if (filterQuery.endDate) filters.endDate = filterQuery.endDate;

    const weather = await this.weatherService.getWeatherPaginated(
      page,
      itemsPerPage,
      Object.keys(filters).length > 0 ? filters : undefined,
    );

    return weather;
  }

  @Get('export-csv')
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="weather.csv"')
  @ApiOperation({
    summary: 'Export weather records to CSV with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'CSV file with weather records',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
        },
      },
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'itemsPerPage',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date (ISO string)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async exportWeatherToCsv(
    @Query() paginationQuery: PaginationQueryDto,
    @Query() filterQuery: FilterWeatherDto,
    @Res() res: Response,
  ) {
    const page =
      paginationQuery.page !== undefined ? Number(paginationQuery.page) : 1;
    const itemsPerPage =
      paginationQuery.itemsPerPage !== undefined
        ? Number(paginationQuery.itemsPerPage)
        : 10;

    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }

    if (itemsPerPage < 1) {
      throw new BadRequestException('ItemsPerPage must be greater than 0');
    }

    const filters: FilterWeatherDto = {};
    if (filterQuery.startDate) filters.startDate = filterQuery.startDate;
    if (filterQuery.endDate) filters.endDate = filterQuery.endDate;

    const weatherResult = await this.weatherService.getWeatherPaginated(
      page,
      itemsPerPage,
      Object.keys(filters).length > 0 ? filters : undefined,
    );

    const csvData = weatherResult.data.map((item) => ({
      ID: item._id.toString(),
      'Temperatura (°C)': item.temperature,
      'Umidade (%)': item.humidity,
      'Velocidade do vento (km/h)': item.wind_speed,
      'Descrição do tempo': translateWeatherDescription(
        item.weather_description,
      ),
      'Probabilidade de chuva (%)': item.rain_probability,
      'Data de captura': item.fetched_at,
    }));

    try {
      const csv = json2csv(csvData);
      res.send(csv);
    } catch {
      throw new BadRequestException('Error generating CSV file');
    }
  }

  @Get('export-xlsx')
  @UseGuards(JwtAuthGuard)
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename="weather.xlsx"')
  @ApiOperation({
    summary: 'Export weather records to XLSX with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'XLSX file with weather records',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'itemsPerPage',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date (ISO string)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async exportWeatherToXlsx(
    @Query() paginationQuery: PaginationQueryDto,
    @Query() filterQuery: FilterWeatherDto,
    @Res({ passthrough: false }) res: Response,
  ) {
    const page =
      paginationQuery.page !== undefined ? Number(paginationQuery.page) : 1;
    const itemsPerPage =
      paginationQuery.itemsPerPage !== undefined
        ? Number(paginationQuery.itemsPerPage)
        : 10;

    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }

    if (itemsPerPage < 1) {
      throw new BadRequestException('ItemsPerPage must be greater than 0');
    }

    const filters: FilterWeatherDto = {};
    if (filterQuery.startDate) filters.startDate = filterQuery.startDate;
    if (filterQuery.endDate) filters.endDate = filterQuery.endDate;

    const weatherResult = await this.weatherService.getWeatherPaginated(
      page,
      itemsPerPage,
      Object.keys(filters).length > 0 ? filters : undefined,
    );

    const xlsxData = weatherResult.data.map((item) => ({
      id: item._id.toString(),
      temperatura: item.temperature,
      umidade: item.humidity,
      velocidadeVento: item.wind_speed,
      descricaoTempo: translateWeatherDescription(item.weather_description),
      probabilidadeChuva: item.rain_probability,
      dataCaptura: item.fetched_at,
    }));

    if (xlsxData.length === 0) {
      throw new BadRequestException('No data to export');
    }

    try {
      const data = [
        {
          sheet: 'Dados do Tempo',
          columns: [
            { label: 'ID', value: 'id' },
            { label: 'Temperatura (°C)', value: 'temperatura' },
            { label: 'Umidade (%)', value: 'umidade' },
            { label: 'Velocidade do vento (km/h)', value: 'velocidadeVento' },
            { label: 'Descrição do tempo', value: 'descricaoTempo' },
            {
              label: 'Probabilidade de chuva (%)',
              value: 'probabilidadeChuva',
            },
            { label: 'Data de captura', value: 'dataCaptura' },
          ],
          content: xlsxData,
        },
      ];

      const settings = {
        fileName: 'weather',
        extraLength: 3,
        writeMode: 'write' as const,
        writeOptions: {
          type: 'buffer' as const,
        },
      };

      const buffer = jsonAsXlsx(data, settings);

      if (!buffer || !Buffer.isBuffer(buffer)) {
        throw new Error(
          `Invalid buffer returned. Type: ${typeof buffer}, Value: ${buffer}`,
        );
      }

      res.send(buffer);
    } catch (error) {
      console.error('Error generating XLSX:', error);
      throw new BadRequestException(
        `Error generating XLSX file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a weather record' })
  @ApiParam({ name: 'id', description: 'Weather record ID' })
  @ApiResponse({
    status: 200,
    description: 'Weather record successfully deleted',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Weather record successfully deleted',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Weather record not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteWeather(@Param('id') id: string): Promise<{ message: string }> {
    const deletedWeather = await this.weatherService.deleteWeather(id);
    if (!deletedWeather) {
      throw new NotFoundException('Weather record not found');
    }
    return { message: 'Weather record successfully deleted' };
  }
}
