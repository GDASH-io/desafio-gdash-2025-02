import { right, type Either } from '@/core/either';
import { WrongCredentialsError } from '@/core/errors/wrong-credentials-error';
import { ClimateRepository } from '../../repository/climate-repository';
import { Climate } from '@/domain/enterprise/entities/climate';
import { Inject, Injectable } from '@nestjs/common';

interface CreateClimateRequest {
  timeStamp: Date;
  temperature: number;
  windSpeed: number;
  windDirection: string;
  weatherCode: string;
}

type CreateClimateResponse = Either<
  WrongCredentialsError,
  { climate: Climate }
>;
@Injectable()
export class CreateClimateUseCase {
  constructor(
    @Inject(ClimateRepository) private climateRepository: ClimateRepository,
  ) {}
  async execute({
    temperature,
    timeStamp,
    weatherCode,
    windDirection,
    windSpeed,
  }: CreateClimateRequest): Promise<CreateClimateResponse> {
    const climate = Climate.create({
      temperature,
      timeStamp,
      weatherCode,
      windDirection,
      windSpeed,
    });

    await this.climateRepository.create(climate);

    return right({ climate });
  }
}
