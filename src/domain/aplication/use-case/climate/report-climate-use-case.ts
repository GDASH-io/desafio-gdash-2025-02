import { left, right, type Either } from '@/core/either';
import { ClimateRepository } from '../../repository/climate-repository';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { UserRepository } from '../../repository/user-repository';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { Inject, Injectable } from '@nestjs/common';
import { AIRepository } from '../../AI/AI-repository';

interface ReportClimateRequest {
  id: string; //id from user
  page: number;
}

type ReportClimateResponse = Either<ResourceNotFoundError, { report: string }>;
@Injectable()
export class ReportClimateUseCase {
  constructor(
    @Inject(UserRepository) private userRepository: UserRepository,
    @Inject(ClimateRepository) private climateRepository: ClimateRepository,
    @Inject(AIRepository) private reportClimate: AIRepository,
  ) {}
  async execute({
    id,
    page,
  }: ReportClimateRequest): Promise<ReportClimateResponse> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      return left(new NotAllowedError());
    }
    const climate = await this.climateRepository.findManyRecent(page);

    if (climate.length === 0) {
      return left(new ResourceNotFoundError());
    }

    const report = await this.reportClimate.report(climate);

    return right({ report });
  }
}
