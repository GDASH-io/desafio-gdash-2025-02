import { Injectable, Inject } from '@nestjs/common';
import { IWeatherLogRepository } from '../../../domain/repositories/weather-log.repository';
import { GetWeatherLogsQueryDto } from '../../../presentation/dto/get-weather-logs-query.dto';

@Injectable()
export class GetWeatherLogsUseCase {
  constructor(
    @Inject('IWeatherLogRepository')
    private readonly weatherLogRepository: IWeatherLogRepository,
  ) {}

  async execute(query: GetWeatherLogsQueryDto) {
    return this.weatherLogRepository.findAll({
      page: query.page,
      limit: query.limit,
      start: query.start ? new Date(query.start) : undefined,
      end: query.end ? new Date(query.end) : undefined,
      city: query.city,
      sort: query.sort || 'desc',
    });
  }
}

