import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WeatherService } from './weather.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { createWeatherSchema } from './validation/create-weather.schema';
import { z } from 'zod';
import {
  WeatherResponseDto,
  PaginatedWeatherResponseDto,
} from './dto/get-weather.dto';
import { PaginationQueryDto } from '../utils/pagination-query.dto';
import { FilterWeatherDto } from './dto/filter-weather.dto';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

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
    const page = paginationQuery.page ? Number(paginationQuery.page) : 1;
    const itemsPerPage = paginationQuery.itemsPerPage
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
