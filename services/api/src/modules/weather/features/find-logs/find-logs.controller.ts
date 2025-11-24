import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { FindLogsService } from './find-logs.service';
import { FindWeatherLogsDto } from '../../dto/find-weather-logs.dto';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { API_ROUTES } from '../../../../shared/constants/api-routes';

@Controller(API_ROUTES.WEATHER.BASE)
@UseGuards(JwtAuthGuard)
export class FindLogsController {
  constructor(private readonly findLogsService: FindLogsService) {}

  @Get(API_ROUTES.WEATHER.LOGS)
  async findAll(@Query() filters: FindWeatherLogsDto) {
    return this.findLogsService.findAll(filters);
  }

  @Get('latest')
  async findLatest(@Query('city') city?: string) {
    return this.findLogsService.findLatest(city);
  }

  @Get('stats')
  async getStats(
    @Query('city') city?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.findLogsService.getStats(city, startDate, endDate);
  }
}
