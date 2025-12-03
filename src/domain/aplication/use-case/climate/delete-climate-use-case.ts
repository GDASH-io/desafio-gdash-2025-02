import { left, right, type Either } from '@/core/either';
import { ClimateRepository } from '../../repository/climate-repository';
import { Climate } from '@/domain/enterprise/entities/climate';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { Inject, Injectable } from '@nestjs/common';

interface DeleteClimateRequest {
  id: string;
}

type DeleteClimateResponse = Either<
  ResourceNotFoundError,
  { climate: Climate }
>;
@Injectable()
export class DeleteClimateUseCase {
  constructor(
    @Inject(ClimateRepository) private climateRepository: ClimateRepository,
  ) {}
  async execute({ id }: DeleteClimateRequest): Promise<DeleteClimateResponse> {
    const climate = await this.climateRepository.findById(id);

    if (!climate) {
      return left(new ResourceNotFoundError());
    }

    await this.climateRepository.delete(id);

    return right({ climate });
  }
}
