import { Controller, Get, Query } from '@nestjs/common';
import { WeatherPaginationService } from './weather-pagination.service';
import { PaginationDto } from './dto/pagination.dto';

@Controller('weather/paginated')
export class WeatherPaginationController {
  constructor(
    private readonly weatherPaginationService: WeatherPaginationService,
  ) {}

  @Get()
  async getPaginated(@Query() paginationDto: PaginationDto) {
    return this.weatherPaginationService.paginate(paginationDto);
  }
}
