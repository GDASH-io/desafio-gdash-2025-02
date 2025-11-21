import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IWeatherLogRepository } from '../../../domain/repositories/weather-log.repository';

@Injectable()
export class GetLatestWeatherLogUseCase {
  constructor(
    @Inject('IWeatherLogRepository')
    private readonly weatherLogRepository: IWeatherLogRepository,
  ) {}

  async execute(city?: string) {
    const log = await this.weatherLogRepository.findLatest(city);
    if (!log) {
      throw new NotFoundException('Nenhum registro encontrado');
    }
    return log;
  }
}

