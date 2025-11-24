import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateLogService } from './create-log.service';
import { CreateWeatherLogDto } from '../../dto/create-weather-log.dto';
import { API_ROUTES } from '../../../../shared/constants/api-routes';

@Controller(API_ROUTES.WEATHER.BASE)
export class CreateLogController {
  constructor(private readonly createLogService: CreateLogService) {}

  @Post(API_ROUTES.WEATHER.LOGS)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createWeatherLogDto: CreateWeatherLogDto,
    @Headers('x-worker-id') workerId?: string,
  ) {
    const log = await this.createLogService.create(createWeatherLogDto, workerId);
    
    return {
      message: 'Weather log created successfully',
      data: log,
    };
  }
}
