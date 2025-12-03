import { left, right, type Either } from '@/core/either';
import { ClimateRepository } from '../../repository/climate-repository';
import { Climate } from '@/domain/enterprise/entities/climate';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { UserRepository } from '../../repository/user-repository';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { Inject, Injectable } from '@nestjs/common';

interface GetClimateRequest {
  id: string; //id from user
  page: number;
}

type GetClimateResponse = Either<ResourceNotFoundError, { climate: Climate[] }>;
@Injectable()
export class GetClimateUseCase {
  constructor(
    @Inject(UserRepository) private userRepository: UserRepository,
    @Inject(ClimateRepository) private climateRepository: ClimateRepository,
  ) {}
  async execute({ id, page }: GetClimateRequest): Promise<GetClimateResponse> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      return left(new NotAllowedError());
    }
    const climate = await this.climateRepository.findManyRecent(page);

    if (climate.length === 0) {
      return left(new ResourceNotFoundError());
    }

    return right({ climate });
  }
}
