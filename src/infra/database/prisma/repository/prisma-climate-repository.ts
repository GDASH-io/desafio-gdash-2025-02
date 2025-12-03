import { ClimateRepository } from '@/domain/aplication/repository/climate-repository';
import { Climate } from '@/domain/enterprise/entities/climate';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PrismaClimateMapper } from '../mappers/prisma-climate-mapper';

@Injectable()
export class PrismaClimateRepository implements ClimateRepository {
  constructor(private prisma: PrismaService) {}

  async create(climate: Climate): Promise<void> {
    const data = PrismaClimateMapper.toPrisma(climate);
    await this.prisma.climate.create({
      data,
    });
  }

  async findById(id: string): Promise<Climate | null> {
    const climate = await this.prisma.climate.findFirst({
      where: {
        id,
      },
    });
    if (!climate) {
      return null;
    }
    return PrismaClimateMapper.toDomain(climate);
  }

  async findManyRecent(page: number): Promise<Climate[]> {
    const climate = await this.prisma.climate.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 24,
      skip: (page - 1) * 24,
    });
    return climate.map(PrismaClimateMapper.toDomain);
  }

  async delete(id: string): Promise<null> {
    await this.prisma.climate.delete({
      where: {
        id,
      },
    });
    return null;
  }
}
