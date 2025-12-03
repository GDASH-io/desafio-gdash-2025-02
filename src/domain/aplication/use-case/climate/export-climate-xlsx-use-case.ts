import { left, right, type Either } from '@/core/either';
import { ClimateRepository } from '../../repository/climate-repository';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { UserRepository } from '../../repository/user-repository';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { Inject, Injectable } from '@nestjs/common';
import { ClimateExport } from '../../export/climate-export';

interface ExportXLSXRequest {
  id: string; //id from user
  page: number;
}

type ExportXLSXResponse = Either<ResourceNotFoundError, { xlsx: Buffer }>;
@Injectable()
export class ExportXLSXUseCase {
  constructor(
    @Inject(UserRepository) private userRepository: UserRepository,
    @Inject(ClimateRepository) private climateRepository: ClimateRepository,
    @Inject(ClimateExport) private climateExport: ClimateExport,
  ) {}
  async execute({ id, page }: ExportXLSXRequest): Promise<ExportXLSXResponse> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      return left(new NotAllowedError());
    }
    const climate = await this.climateRepository.findManyRecent(page);

    if (climate.length === 0) {
      return left(new ResourceNotFoundError());
    }

    const xlsx = await this.climateExport.xlsxExport(climate);

    return right({ xlsx });
  }
}
