import { left, right, type Either } from '@/core/either';
import { ClimateRepository } from '../../repository/climate-repository';
import { Climate } from '@/domain/enterprise/entities/climate';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { UserRepository } from '../../repository/user-repository';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { Inject, Injectable } from '@nestjs/common';
import { ClimateExport } from '../../export/climate-export';

interface ExportCSVRequest {
  id: string; //id from user
  page: number;
}

type ExportCSVResponse = Either<ResourceNotFoundError, { csv: string }>;
@Injectable()
export class ExportCSVUseCase {
  constructor(
    @Inject(UserRepository) private userRepository: UserRepository,
    @Inject(ClimateRepository) private climateRepository: ClimateRepository,
    @Inject(ClimateExport) private climateExport: ClimateExport,
  ) {}
  async execute({ id, page }: ExportCSVRequest): Promise<ExportCSVResponse> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      return left(new NotAllowedError());
    }
    const climate = await this.climateRepository.findManyRecent(page);

    if (climate.length === 0) {
      return left(new ResourceNotFoundError());
    }

    const csv = await this.climateExport.csvExport(climate);

    return right({ csv });
  }
}
